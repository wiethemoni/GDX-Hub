import yfinance as yf
import pandas as pd
from supabase import create_client, Client
import os
from datetime import datetime, timedelta

# Supabase Credentials (환경 변수 또는 설정 파일에서 로드 권장)
SUPABASE_URL = "YOUR_SUPABASE_URL"
SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_and_sync_market_data(symbols=["GDXU", "GDXY", "GDX", "GC=F"]):
    """
    yfinance에서 데이터를 가져와 Supabase market_data 테이블에 업서트합니다.
    """
    print(f"[{datetime.now()}] 실시간 데이터 동기화 시작...")
    
    for symbol in symbols:
        try:
            # 최근 1일치 1분 단위 데이터 (또는 필요에 따라 변경)
            ticker = yf.Ticker(symbol)
            df = ticker.history(period="1d", interval="1m")
            
            if df.empty:
                print(f"Skipping {symbol}: No data found.")
                continue

            # Supabase 저장용 데이터 변환
            # GC=F(금 선물)의 경우 DB에는 GOLD로 저장하도록 매핑 예시
            db_symbol = "GOLD" if symbol == "GC=F" else symbol
            
            data_to_upsert = []
            for index, row in df.iterrows():
                data_to_upsert.append({
                    "symbol": db_symbol,
                    "timestamp": index.isoformat(),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else 0
                })

            # 테이블에 Upsert (symbol, timestamp 기준 UNIQUE 제약 필요)
            # Supabase Python SDK의 upsert는 on_conflict=None면 기본 PK 기준이나 
            # market_data에는 (symbol, timestamp) 유니크 인덱스가 설정되어 있어야 함
            result = supabase.table("market_data").upsert(
                data_to_upsert, 
                on_conflict="symbol,timestamp"
            ).execute()
            
            print(f"Successfully synced {len(data_to_upsert)} rows for {db_symbol}")

        except Exception as e:
            print(f"Error syncing {symbol}: {str(e)}")

if __name__ == "__main__":
    fetch_and_sync_market_data()
