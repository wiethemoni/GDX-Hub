import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.local")

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

def cleanup_gdxy():
    print("[CLEANUP] Deleting GDXY data from market_data...")
    res1 = supabase.table("market_data").delete().eq("symbol", "GDXY").execute()
    print(f"[CLEANUP] Deleted {len(res1.data) if res1.data else 0} rows from market_data.")

    print("[CLEANUP] Deleting GDXY data from predictions...")
    res2 = supabase.table("predictions").delete().eq("symbol", "GDXY").execute()
    print(f"[CLEANUP] Deleted {len(res2.data) if res2.data else 0} rows from predictions.")

if __name__ == "__main__":
    cleanup_gdxy()
