# 🎯 DealSense — AI Deal Intelligence Agent

An intelligent, memory-augmented sales assistant designed to empower sales teams with instant, context-aware pre-call executive briefings.

Powered by Groq for fast AI inference and Hindsight (Vectorize.io) for persistent memory retention and semantic recall.

---

## ✨ Key Features

- ⚡ Instant Pre-Call Briefings: Generates structured briefings highlighting customer objections, competitor mentions, current sentiment, and recommended talking points.

- 🧠 Persistent Memory with Hindsight: Retains sales-call facts, stakeholder preferences, objections, competitors, and sentiment, then semantically recalls relevant customer context for future briefings.

- 📈 Historical Call Timeline: Interactive timeline view of past calls to track deal-stage and sentiment progression over time.

- ➕ Dynamic Call Logging: Log new sales calls in real time, persist call history, and retain new customer insights in Hindsight for future recall.

- 🛡️ Fail-Safe Architecture: Gracefully handles API timeouts and connection issues with local fallback caching.

---

## 🛠️ Technology Stack

- Frontend: React 18, Vite, Tailwind CSS, Lucide Icons
- Backend: Python 3.13, FastAPI, Uvicorn, python-dotenv, Pydantic
- AI & Inference: Groq API (openai/gpt-oss-120b)
- Memory Engine: Hindsight Cloud (hindsight-client by Vectorize.io)

---

## ⚙️ Environment Variables

Create a .env file in the project root:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Hindsight Configuration
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_BANK_ID=dealsense-sales
