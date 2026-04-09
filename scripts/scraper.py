import os
import yfinance as yf
import pandas as pd
import xgboost as xgb
import joblib
import numpy as np
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
from ai_utils import calculate_indicators, get_model_path

# Load environment variables
load_dotenv(dotenv_path=".env.local")

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

SYMBOLS = ["GDXU", "GLD", "GDX", "GC=F"]

def scrape_data():
    """야후 파이낸스에서 데이터를 긁어와 이격도까지 계산하여 DB에 영구 저장"""
    for symbol in SYMBOLS:
        for interval_key, interval in [("5m", "5m"), ("1h", "1h"), ("1d", "1d")]:
            try:
                ticker = yf.Ticker(symbol)
                period = "60d" if interval == "5m" else "max"
                df = ticker.history(period=period, interval=interval)
                
                if df.empty:
                    continue

                # 📊 핵심: 이격도 및 이평선 데이터 실시간 생성
                df = calculate_indicators(df)
                
                # 최적화된 Batch Upsert 진행
                batch_data = []
                for index, row in df.iterrows():
                    data = {
                        "symbol": symbol,
                        "interval": interval,
                        "timestamp": index.isoformat(),
                        "open": float(row["Open"]),
                        "high": float(row["High"]),
                        "low": float(row["Low"]),
                        "close": float(row["Close"]),
                        "volume": int(row["Volume"]) if not np.isnan(row["Volume"]) else 0,
                        "ma20": float(row["ma20"]) if not np.isnan(row["ma20"]) else None,
                        "ma60": float(row["ma60"]) if not np.isnan(row["ma60"]) else None,
                        "gap_ma20": float(row["gap_ma20"]) if not np.isnan(row["gap_ma20"]) else None,
                        "gap_ma60": float(row["gap_ma60"]) if not np.isnan(row["gap_ma60"]) else None
                    }
                    batch_data.append(data)
                
                if batch_data:
                    supabase.table("market_data").upsert(
                        batch_data, 
                        on_conflict="symbol,interval,timestamp"
                    ).execute()

                print(f"✅ [{symbol}] {interval} - {len(batch_data)} rows persisted (Batch Upsert).")

                # 🤖 3개 모델에 대한 AI 추론 진행 (동일하게 유지)
                if symbol == "GDXU":
                    run_inference(symbol, interval, df)

            except Exception as e:
                print(f"❌ Error scraping {symbol} ({interval}): {e}")

def run_inference(symbol, interval, df):
    """3개의 독립 AI 모델로부터 예측치를 산출하여 DB 저장"""
    try:
        # 모델 1 (Multi-Step Price & MA Path)
        m1_path = get_model_path(symbol, interval, 1)
        # 모델 2, 3 (Gap 전문 모델)
        m2_path = get_model_path(symbol, interval, 2)
        m3_path = get_model_path(symbol, interval, 3)

        def predict_for_model(model_path, name):
            if not os.path.exists(model_path):
                return
            model = joblib.load(model_path)
            
            # 마지막 시점의 피처 추출 (7개 규격: returns, rsi, volatility, gap_ma20, gap_ma60, ma20, ma60)
            last_row = df.iloc[-1]
            features = np.array([[
                last_row['returns'], last_row['rsi'], last_row['volatility'],
                last_row['gap_ma20'], last_row['gap_ma60'],
                last_row['ma20'], last_row['ma60']
            ]])
            
            pred = model.predict(features)[0]
            
            # 타겟 데이터 구조화 (3일치 예측 등)
            targets = []
            for i in range(1, 4):
                if name == "Model 2 (ma20 Gap)":
                    targets.append({"gap_return": float(pred[i-1]) if hasattr(pred, '__len__') else float(pred)})
                elif name == "Model 3 (ma60 Gap)":
                    targets.append({"gap_return": float(pred[i-1]) if hasattr(pred, '__len__') else float(pred)})
                else: # Model 1
                    targets.append({
                        "predicted_return": float(pred[i-1]),
                        "ma20_return": float(pred[i+2]),
                        "ma60_return": float(pred[i+5])
                    })

            supabase.table("predictions").insert({
                "symbol": symbol,
                "interval": interval,
                "model_name": name,
                "prediction_data": {"targets": targets},
                "confidence": 0.85
            }).execute()

        predict_for_model(m1_path, "Model 1 (Multi-Step)")
        predict_for_model(m2_path, "Model 2 (ma20 Gap)")
        predict_for_model(m3_path, "Model 3 (ma60 Gap)")

    except Exception as e:
        print(f"🤖 Inference Error: {e}")

if __name__ == "__main__":
    scrape_data()
