import os
import sys
from pathlib import Path
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from groq import Groq

# Configure stdout to handle UTF-8 / emojis on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
for env_path in [BASE_DIR / ".env", PROJECT_ROOT / ".env"]:
    if env_path.exists():
        load_dotenv(env_path)
load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY is missing. Add it to your .env file.")

client = Groq(api_key=groq_api_key)

response = client.chat.completions.create(
    model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
    messages=[
        {
            "role": "user",
            "content": "Say hello to my Deal Intelligence Agent"
        }
    ]
)

print(response.choices[0].message.content)