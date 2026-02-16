import asyncio
import os
from dotenv import load_dotenv
from telegram import Bot

async def main():
    load_dotenv()
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        print("Error: TELEGRAM_BOT_TOKEN not found in .env")
        return

    print(f"Checking for messages using token: {token[:5]}...")
    try:
        bot = Bot(token)
        updates = await bot.get_updates() # Fetch last updates
        
        if not updates:
            print("No new messages found. Please send '/start' to your bot in Telegram, then run this script again.")
            return

        last_update = updates[-1]
        chat_id = last_update.effective_chat.id
        username = last_update.effective_chat.username or "User"
        
        print(f"\nSUCCESS! Found message from {username}")
        print(f"Create/Update your .env file with:")
        print(f"TELEGRAM_CHAT_ID={chat_id}")
        
    except Exception as e:
        print(f"Error fetching updates: {e}")

if __name__ == "__main__":
    asyncio.run(main())
