import requests

try:
    r = requests.get("http://localhost:8000/health", timeout=5)
    print(f"Status: {r.status_code}")
    print(r.json())
except Exception as e:
    print(f"Error: {e}")
