import os
import yfinance as yf
import pandas as pd
import xgboost as xgb
import joblib
import numpy as np

def calculate_indicators(df):
    """모든 AI 모델이 공통으로 사용할 지표 계산기"""
    df = df.copy()
    df['returns'] = df['Close'].pct_change()
    
    # 이평선 및 이격도
    df['ma20'] = df['Close'].rolling(window=20).mean()
    df['ma60'] = df['Close'].rolling(window=60).mean()
    df['gap_ma20'] = (df['Close'] - df['ma20']) / df['ma20'] # 20선 이격률
    df['gap_ma60'] = (df['Close'] - df['ma60']) / df['ma60'] # 60선 이격률
    
    # RSI
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    
    # 변동성
    df['volatility'] = df['returns'].rolling(window=20).std()
    
    return df.dropna()

def get_model_path(model_name, interval):
    os.makedirs('models', exist_ok=True)
    return f'models/model_{model_name}_{interval}.pkl'

def train_logic(symbol, interval, period="730d"):
    """9개의 타겟(Close, MA20, MA60 x 3단계)을 동시에 학습"""
    print(f"[AI-TRAIN] {symbol} {interval} Integrated training...")
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period, interval=interval)
    
    df = calculate_indicators(df)
    
    # 🎯 9개 타겟 생성 (안정성을 위해 자체 수익률 기반으로 수정)
    targets = []
    for i in [1, 2, 3]:
        df[f'target_close_{i}'] = (df['Close'].shift(-i) - df['Close']) / df['Close']
        df[f'target_ma20_{i}'] = (df['ma20'].shift(-i) - df['ma20']) / df['ma20'] # MA 자체 수익률 추종
        df[f'target_ma60_{i}'] = (df['ma60'].shift(-i) - df['ma60']) / df['ma60']
        targets.extend([f'target_close_{i}', f'target_ma20_{i}', f'target_ma60_{i}'])
    
    df = df.dropna()
    features = ['returns', 'rsi', 'volatility', 'gap_ma20', 'gap_ma60', 'ma20', 'ma60']
    
    # 성적 측정을 위해 데이터 분할
    split = int(len(df) * 0.8)
    train_df = df.iloc[:split]
    test_df = df.iloc[split:]
    
    model = xgb.XGBRegressor(n_estimators=150, max_depth=6, learning_rate=0.05, random_state=42)
    model.fit(train_df[features], train_df[targets])
    
    # 실력 테스트 (종가 방향 적중률 위주로 측정)
    preds = model.predict(test_df[features])
    match = (np.sign(preds[:, 0]) == np.sign(test_df['target_close_1'].values)).sum()
    accuracy = float(match / len(test_df))
    
    path = get_model_path("1", interval)
    joblib.dump({"model": model, "accuracy": accuracy, "features": features, "targets": targets}, path)
    print(f"[AI-TRAIN] Integrated Model saved to {path} (Acc: {accuracy:.2%})")
