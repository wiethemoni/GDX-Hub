from ai_utils import train_logic

def main():
    # 1. 1시간봉 모델 학습 (최근 2년치 데이터)
    train_logic(symbol="GDX", interval="1h", period="730d")
    
    # 2. 1일봉 모델 학습 (전체 데이터)
    train_logic(symbol="GDX", interval="1d", period="max")
    
    print("\n[SUCCESS] Both 1h and 1d AI models successfully trained and updated.")

if __name__ == "__main__":
    main()
