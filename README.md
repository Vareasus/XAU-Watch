# AurumWatch

**AurumWatch** is a comprehensive full-stack application for tracking gold prices (Turkey market), executing trading strategies, and receiving Telegram alerts. It features a modern React/Next.js frontend and a powerful FastAPI backend with SQLAlchemy.

## 🚀 Features

- **Real-Time Market Data**: Scrapes live Turkish gold prices (XAU/TRY).
- **Trading Bot Strategy**: Customizable limits and automated trade signals.
- **Telegram Integration**: Receive instant alerts for Buy/Sell triggers or account activity.
- **User Management**: Authentication, Registration (Admin Role for `anilcylnn`), & Logging.
- **Admin Dashboard**: Manage bot limits, view credential logs, and system status.
- **Responsive UI**: Interactive charts, market statistics, and smooth animations.

## 📂 Project Structure

- **frontend/**: Next.js + React.js Application. Source located in `src/`.
- **backend/**: Python FastAPI server. Contains logic for scraping, database, and bot services.

## 🛠️ Installation & Setup

### prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/AnilCylnn/XAU-Watch.git
cd XAU-Watch
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:

```bash
cd backend
# Create Virtual Environment (Optional but recommended)
python -m venv venv
# Activate venv:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install Requirements
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Open .env and set your TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID

# Run Server
uvicorn main:app --reload
```
Backend will start at `http://localhost:8000`.

### 3. Frontend Setup
Navigate to the frontend directory:

```bash
cd ../frontend
npm install

# Run Development Server
npm run dev
```
Frontend will start at `http://localhost:3001`.

## 📡 Deployment

This project is configured for easy deployment:
- **Frontend**: Deploy to **Vercel** or **Netlify**. Set `NEXT_PUBLIC_API_URL` environment variable to your backend URL.
- **Backend**: Deploy to **Render**, **Railway**, or **PythonAnywhere**. Set `FRONTEND_URL` environment variable for redirection.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👤 Author

**Anil Cylnn**
- GitHub: [@AnilCylnn](https://github.com/AnilCylnn)

---
*Built with ❤️ for Gold Trading Automation*
