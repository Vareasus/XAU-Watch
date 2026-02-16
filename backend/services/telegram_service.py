import asyncio
from telegram import Bot
from collections import deque
import numpy as np
from services.gold_scraper import get_turkish_prices

class GoldSignalBot:
    def __init__(self, token: str, chat_id: str):
        self.bot = Bot(token=token)
        self.chat_id = chat_id
        self.running = False
        
        # Define Price Thresholds (Buy if below, Sell if above)
        # Based on current 2026 estimates
        self.targets = {
            'gram': {'name': 'Gram Altın', 'buy': 7250, 'sell': 7450},
            'quarter': {'name': 'Çeyrek Altın', 'buy': 12000, 'sell': 12200},
            'half': {'name': 'Yarım Altın', 'buy': 24000, 'sell': 24400},
            'ata': {'name': 'Ata Altın', 'buy': 49500, 'sell': 50500},
            'gremse': {'name': 'Gremse Altın', 'buy': 119000, 'sell': 122000}
        }
        
        # Track last alert to prevent spam (timestamps)
        self.last_alerts = {}
        
        # Store sent messages for frontend display
        self.sent_messages = [] 

    async def start_monitoring(self):
        self.running = True
        print(f"Telegram Bot started monitoring for chat_id={self.chat_id}")
        
        await self.send_message("🛠 **Technical Analysis Bot Started**\nMonitoring prices for Gram, Quarter, Half, Ata, Gremse...")
        
        while self.running:
            try:
                prices = await get_turkish_prices()
                
                if not prices:
                    await asyncio.sleep(60)
                    continue

                for key, targets in self.targets.items():
                    if key not in prices: continue
                    
                    price_info = prices[key]
                    current_price = price_info['selling']
                    name = targets['name']
                    
                    # BUY Signal (Price < Buy Target)
                    if current_price < targets['buy']:
                        await self.check_and_send_alert(key, 'BUY', current_price, targets['buy'])
                        
                    # SELL Signal (Price > Sell Target)
                    elif current_price > targets['sell']:
                        await self.check_and_send_alert(key, 'SELL', current_price, targets['sell'])
                
                print(f"Bot cycle completed. Checked {len(prices)} assets.")
                
            except Exception as e:
                print(f"Bot error: {e}")
            
            # Check every 5 minutes
            await asyncio.sleep(300)

    async def check_and_send_alert(self, key, signal, current, target):
        import time
        now = time.time()
        
        # Global Cooldown: Max 1 message every 3 hours (10800 seconds)
        # Check if we sent ANY alert recently
        last_global = getattr(self, 'last_message_time', 0)
        if now - last_global < 10800:
            return

        # Per-Asset Cooldown (Keep as backup logic, though global covers it now)
        last_time = self.last_alerts.get(key, {}).get(signal, 0)
        if now - last_time < 10800:
            return

        emoji = "🟢" if signal == 'BUY' else "🔴"
        direction = "below" if signal == 'BUY' else "above"
        
        message = (
            f"{emoji} **ALERT: {self.targets[key]['name']}**\n"
            f"Price is {direction} target!\n\n"
            f"Current: **{current:,.2f} TRY**\n"
            f"Target: {target:,.2f} TRY\n"
            f"Action: **{signal} NOW!** 🚀"
        )
        
        await self.send_message(message)
        
        # Update timestamps
        self.last_message_time = now
        if key not in self.last_alerts: self.last_alerts[key] = {}
        self.last_alerts[key][signal] = now

    async def send_message(self, text):
        from datetime import datetime
        try:
            # Store in memory (maxlen 50 could be good, but list is fine for now)
            self.sent_messages.insert(0, {
                "text": text,
                "timestamp": datetime.now().isoformat(),
                "read": False
            })
            if len(self.sent_messages) > 50:
                self.sent_messages.pop()
                
            await self.bot.send_message(chat_id=self.chat_id, text=text, parse_mode='Markdown')
        except Exception as e:
            print(f"Failed to send Telegram message: {e}")

    def stop(self):
        self.running = False
