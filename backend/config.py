from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./aurumwatch.db"
    REDIS_URL: str = "redis://localhost:6379/0" # Redis might fail if not installed locally, but we can handle that later or mock it.
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str | None = None
    TELEGRAM_CHAT_ID: str | None = None

    class Config:
        env_file = ".env"
        extra = "ignore" # Allow other env vars

settings = Settings()
