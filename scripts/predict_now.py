from scraper import run_ai_inference
import time

def main():
    start_time = time.time()
    print("[RUN-AI] Starting AI prediction engine only...")
    
    # 우리가 원하는 종목만 딱 집어서 예측 실행
    for symbol in ["GDXU", "GDXY"]:
        print(f"\n--- Analysis for {symbol} ---")
        run_ai_inference(symbol, "1h")
        run_ai_inference(symbol, "1d")

    print(f"\n[FINISH] AI Prediction completed in {time.time() - start_time:.2f}s")

if __name__ == "__main__":
    main()
