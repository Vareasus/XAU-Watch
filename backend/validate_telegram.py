import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Adapted to match .env variable names
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

if not TOKEN or not CHAT_ID:
    print("Error: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not found in .env")
    exit(1)

message = "Backend'den otomatik mesaj geldi 👨‍💻"

url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"

payload = {
    "chat_id": CHAT_ID,
    "text": message
}

try:
    r = requests.post(url, data=payload, timeout=10)
    print(r.json())
except Exception as e:
    print(f"Error sending message: {e}")
