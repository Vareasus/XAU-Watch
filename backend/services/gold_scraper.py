import httpx
from bs4 import BeautifulSoup
import re
import time
import asyncio

# Simple in-memory cache
_cache = {
    "data": {},
    "timestamp": 0
}

async def get_turkish_prices():
    global _cache
    # Return cached data if valid (< 60 seconds)
    if time.time() - _cache["timestamp"] < 60 and _cache["data"]:
        return _cache["data"]

    url = "https://canlidoviz.com/altin-fiyatlari/kapali-carsi"
    headers = {"User-Agent": "Mozilla/5.0"}
    prices = {}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url, headers=headers)
        
        soup = BeautifulSoup(r.content, "html.parser")
        
        table = soup.find("table")
        if not table:
            return {}

        rows = table.find_all("tr")
        
        target_map = {
            "Has Altın": "gram",
            "Gram Altın": "gram",
            "Çeyrek Altın": "quarter", 
            "Yarım Altın": "half",
            "Tam Altın": "full", 
            "Cumhuriyet Altını": "republic",
            "Ata Altın": "ata",
            "Gremse Altın": "gremse",
            "22 Ayar Bilezik": "bracelet_22",
            "14 Ayar Altın": "gold_14"
        }

        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 3:
                continue
            
            # col[0] name, col[1] buy, col[2] sell
            name_text = cols[0].get_text(strip=True)
            
            matched_key = None
            matched_name = None
            
            for target_name, key in target_map.items():
                if target_name in name_text:
                    if "Eski" in name_text and "Yeni" not in name_text:
                        continue 
                    matched_key = key
                    matched_name = target_name
                    break
            
            if matched_key:
                raw_buy = cols[1].get_text(strip=True)
                raw_sell = cols[2].get_text(strip=True)
                
                # Robust cleaning logic
                def clean_price(t):
                    try:
                        # Case 1: English format (e.g. 47645.00)
                        if re.search(r'\.\d{2}$', t): 
                            clean = t.replace(",", "") 
                            match = re.search(r'\d+(\.\d+)?', clean)
                            if match: return float(match.group(0))
                        
                        # Case 2: Turkish Formal (e.g. 49.117 or 49.117,00)
                        match = re.search(r'(\d{1,3}(?:\.\d{3})+(?:,\d+)?)', t)
                        if match:
                            val = match.group(1).replace(".", "").replace(",", ".")
                            return float(val)
                            
                        # Case 3: Raw digits
                        match = re.search(r'(\d+(?:,\d+)?)', t)
                        if match:
                            val = match.group(1).replace(".", "").replace(",", ".")
                            return float(val)
                        return 0.0
                    except:
                        return 0.0

                buy_price = clean_price(raw_buy)
                sell_price = clean_price(raw_sell)
                
                prices[matched_key] = {
                    "name": matched_name,
                    "buying": buy_price,
                    "selling": sell_price,
                    "change": 0.5 
                }

        # Update cache
        if prices:
            _cache["data"] = prices
            _cache["timestamp"] = time.time()

        return prices

    except Exception as e:
        print(f"Error scraping prices: {e}")
        return {}

if __name__ == "__main__":
    print(asyncio.run(get_turkish_prices()))
