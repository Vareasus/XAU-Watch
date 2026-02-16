# How to Use the Telegram Gold Signal Bot 🤖

Your AurumWatch application now includes a built-in Telegram bot that monitors gold prices and sends alerts when it's a good time to Buy or Sell based on RSI analysis.

## 1. Create a Bot
1. Open Telegram and search for **@BotFather**.
2. Send the message `/newbot`.
3. Follow the instructions to choose a name and username (e.g., `MyGoldWatchBot`).
4. **Copy the API TOKEN** provided by BotFather (it looks like `123456789:ABCdefGHI...`).

## 2. Get Your Chat ID
1. Search for your new bot in Telegram and click **Start**.
2. Send a message to the bot (e.g., "Hello").
3. To find your Chat ID, you can forward a message from yourself to **@userinfobot** or visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in your browser and look for `"chat":{"id":123456789...`.
   - The Chat ID is usually a number like `123456789`.

## 3. Configure the Backend
1. Open the file `backend/.env` (create it if it doesn't exist, using `.env.example` as a template).
2. Add your token and chat ID:

```env
TELEGRAM_BOT_TOKEN=paste_your_token_here
TELEGRAM_CHAT_ID=paste_your_chat_id_here
```

## 4. Restart the Backend
The bot starts automatically when the backend server launches.
1. Stop the current backend terminal (Ctrl+C).
2. Run it again:
   ```bash
   uvicorn main:app --reload
   ```

## Usage
- The bot checks prices every **5 minutes**.
- It calculates an **RSI (Relative Strength Index)** based on the last 20 price points.
- **BUY Signal**: If RSI < 30 (Price dropped significantly).
- **SELL Signal**: If RSI > 70 (Price spiked significantly).
- You will receive a message like: "🟢 GOLD ALERT: BUY! Current Gram Gold: 3,050.50 TRY".
