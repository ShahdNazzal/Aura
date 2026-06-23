from fastapi import FastAPI
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

# 🔥 مهم: نحدد ملف env.local
load_dotenv(".env.local")

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # للتجربة
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 قراءة المفتاح
api_key = os.getenv("GROQ_API_KEY")

# (اختياري للتأكد)
print("GROQ KEY LOADED:", "YES" if api_key else "NO")

client = Groq(
    api_key=api_key
)

class Message(BaseModel):
    text: str

@app.get("/")
def home():
    return {"status": "running 🚀"}

@app.post("/chat")
async def chat(message: Message):

    try:
        response = client.chat.completions.create(
    model="llama-3.1-8b-instant",  # ✅ الجديد
    messages=[
        {
            "role": "system",
            "content": """
You are a self-improvement chatbot.
Reply in the same language as the user.
"""
        },
        {
            "role": "user",
            "content": message.text
        }
    ],
    temperature=0.7
)

        return {
            "reply": response.choices[0].message.content
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {
            "reply": "Server error 😢",
            "error": str(e)
        }