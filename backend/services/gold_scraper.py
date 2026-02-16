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
        
        # Helper function to create safe keys from Turkish text
        def slugify_turkish(text):
            """Convert Turkish text to safe key: 'Beşli Altın' -> 'besli_altin'"""
            text = text.lower()
            replacements = {
                'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
                'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
            }
            for tr, en in replacements.items():
                text = text.replace(tr, en)
            # Remove special chars, keep alphanumeric and spaces
            text = re.sub(r'[^a-z0-9\s]', '', text)
            # Replace spaces with underscores
            text = re.sub(r'\s+', '_', text.strip())
            return text
        
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

        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 3:
                continue
            
            # col[0] name, col[1] buy, col[2] sell
            # Use separator to avoid "GAGram" concatenation issues
            full_text = cols[0].get_text(separator=' ', strip=True)
            
            # Helper to clean the name
            def clean_name_text(text):
                # 1. Remove time patterns (e.g. 16:31:16)
                text = re.sub(r'\d{2}:\d{2}:\d{2}', '', text)
                
                # 2. Known trash prefixes/codes cleaning based on screenshot analysis
                # "GA Gram" -> "Gram", "XHGLD Has" -> "Has", "T Tam" -> "Tam", "GR Gremse" -> "Gremse"
                # "ATA Ata" -> "Ata", "C Ceyrek" -> "Ceyrek" (or Ç)
                
                parts = text.split()
                cleaned_parts = []
                
                for part in parts:
                    # Skip common codes if they appear alone
                    if part in ['GA', 'XHGLD', 'GR', 'ATA', 'C', 'T', 'Y', 'ZZ']: 
                        continue
                    # Skip if part is suspiciously like the start of the next word (e.g. "C" before "Çeyrek" or "T" before "Tam")
                    # but splitting by space usually handles "GA Gram" well. 
                    
                    cleaned_parts.append(part)
                
                # Join back
                name = " ".join(cleaned_parts)
                
                # Double check for concatenated artifacts if separator didn't work (fallback)
                # "CCeyrek" -> "Çeyrek"
                # This often handles "CodeName" if separator wasn't inserted by BS4 (e.g. text nodes)
                # But we used separator=' ' so hopefully it's "Code Name".
                
                # Fix specific known bad starts if they persist
                if name.startswith("GA Gram"): name = name.replace("GA ", "")
                if name.startswith("XHGLD"): name = name.replace("XHGLD", "").strip()
                if name.startswith("ATA Ata"): name = name.replace("ATA ", "")
                
                # Remove any leftover short prefix if it matches the first letter of name? 
                # e.g. "C Çeyrek"
                if len(parts) > 1 and len(parts[0]) <= 2 and parts[1].startswith(parts[0]):
                     # Example: "C Çeyrek" (C is not prefix of Ç exactly in unicode but visually close)
                     # Or "T Tam"
                     pass 

                # Final cleanup
                return name.strip()

            name_text = clean_name_text(full_text)
            
            # Skip empty or header rows
            if not name_text or name_text.lower() in ['altın', 'döviz', 'name', 'isim']:
                continue
            
            # Skip "Eski" (old) versions if "Yeni" (new) exists
            if "Eski" in name_text and "Yeni" not in name_text:
                continue
            
            # Generate key from name
            key = slugify_turkish(name_text)
            
            # Extract prices
            raw_buy = cols[1].get_text(strip=True)
            raw_sell = cols[2].get_text(strip=True)
            
            buy_price = clean_price(raw_buy)
            sell_price = clean_price(raw_sell)
            
            # Only add if prices are valid
            if buy_price > 0 or sell_price > 0:
                prices[key] = {
                    "name": name_text,
                    "buying": buy_price,
                    "selling": sell_price,
                    "change": 0.5  # Placeholder
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
