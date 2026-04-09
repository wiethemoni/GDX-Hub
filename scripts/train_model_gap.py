import yfinance as yf
import pandas as pd
import xgboost as xgb
import joblib
import numpy as np
from ai_utils import calculate_indicators, get_model_path

def train_gap_model(symbol, interval, ma_type="ma20", model_id="2"):
    """이격률(Gap %) 전문 학습 로직"""
    print(f"[AI-GAP-TRAIN] {symbol} {interval} {ma_type} training...")
    ticker = yf.Ticker(symbol)
    df = ticker.history(period="730d", interval=interval)
    
    df = calculate_indicators(df)
    
    # 이격률 계산 (사용자 요청: 이평선 기준 종가 이격 %)
    gap_col = f'gap_{ma_type}'
    df[gap_col] = (df['Close'] - df[ma_type]) / df[ma_type]
    
    # 🎯 미래 3개 이격률 타겟 생성
    targets = []
    for i in [1, 2, 3]:
        target_name = f'target_{ma_type}_gap_{i}'
        df[target_name] = df[gap_col].shift(-i)
        targets.append(target_name)
    
    df = df.dropna()
    # 이격도 예측을 위한 핵심 피처들 (ai_utils 규격인 7개로 통일)
    features = ['returns', 'rsi', 'volatility', 'gap_ma20', 'gap_ma60', 'ma20', 'ma60']
    
    split = int(len(df) * 0.8)
    train_df = df.iloc[:split]
    test_df = df.iloc[split:]
    
    model = xgb.XGBRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42)
    model.fit(train_df[features], train_df[targets])
    
    # 성적 측정 (방향성 적중률)
    preds = model.predict(test_df[features])
    # 이격이 좁혀지는지 벌어지는지 방향 테스트
    match = (np.sign(preds[:, 0] - test_df[gap_col].values) == np.sign(test_df[targets[0]].values - test_df[gap_col].values)).sum()
    accuracy = float(match / len(test_df))
    
    path = get_model_path(model_id, interval)
    joblib.dump({"model": model, "accuracy": accuracy, "ma_type": ma_type}, path)
    print(f"[AI-GAP-TRAIN] Model {model_id} saved: {path} (Acc: {accuracy:.2%})")

if __name__ == "__main__":
    # GDX 기준 데이터로 20선, 60선 모델 각각 학습
    for itv in ['1h', '1d']:
        train_gap_model("GDX", itv, "ma20", "2") # 모델 2호: 20선 이격
        train_gap_model("GDX", itv, "ma60", "3") # 모델 3호: 60선 이격
