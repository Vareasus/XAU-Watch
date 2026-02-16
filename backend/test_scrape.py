import requests
from bs4 import BeautifulSoup

def test_scrape():
    url = "https://canlidoviz.com/altin-fiyatlari/kapali-carsi"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        r = requests.get(url, headers=headers)
        soup = BeautifulSoup(r.content, "html.parser")
        
        # Look for the table with prices
        table = soup.find("table")
        if table:
            rows = table.find_all("tr")
            for row in rows:
                cols = row.find_all("td")
                name = row.find("th") or (cols[0] if cols else None)
                if name and len(cols) > 0:
                    print(f"Name: {name.get_text(strip=True)} | Buy: {cols[0].get_text(strip=True)} | Sell: {cols[1].get_text(strip=True)}")
        else:
            print("No table found")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_scrape()
