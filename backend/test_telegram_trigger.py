import requests

def trigger():
    try:
        r = requests.post("http://localhost:8000/api/telegram/test")
        print(f"Status: {r.status_code}")
        print(f"Response: {r.json()}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    trigger()
