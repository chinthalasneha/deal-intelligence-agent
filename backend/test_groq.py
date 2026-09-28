import os
from dotenv import load_dotenv
from groq import Groq

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