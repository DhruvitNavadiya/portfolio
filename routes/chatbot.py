# routes/chatbot.py
from __future__ import annotations

import os, json
from pathlib import Path
from typing import AsyncIterator

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# LangChain – lightweight, fast config
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

router = APIRouter()

# ---------- Singletons (created once) ----------
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    # Raise at import so you notice early (or make route return a helpful error)
    print("[chatbot] WARNING: GEMINI_API_KEY not set. /ask-stream will return an error.")

# Load portfolio context ONCE
CTX_PATH = Path(__file__).with_name("dhruvit.txt")
RAW_CONTEXT = ""
if CTX_PATH.exists():
    try:
        RAW_CONTEXT = CTX_PATH.read_text(encoding="utf-8")
    except Exception as e:
        print(f"[chatbot] Could not read dhruvit.txt: {e}")

# Trim context to keep prompts snappy (tune if you like)
CONTEXT = RAW_CONTEXT[:3000] if RAW_CONTEXT else ""

# Fast model & guarded length for speed
_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    temperature=0.4,
    max_output_tokens=512,
    max_retries=2,
    google_api_key=GOOGLE_API_KEY,
)

_prompt = PromptTemplate.from_template(
    """
You are Dhruvit's portfolio assistant. 
Your role is to answer clearly, professionally, and in a friendly tone. 

Guidelines:
- Always base your response on the provided context. 
- Keep answers short, helpful, and easy to understand. 
- Highlight Dhruvit’s skills, experience, and projects when relevant. 
- If the user greets you (e.g., "hi", "hello", "good morning"), reply with a warm and polite greeting back before continuing. 
- If the question is not related to Dhruvit, his portfolio, or this site, politely say: 
  "This question is outside the scope of Dhruvit’s portfolio assistant." 
- Avoid unnecessary details or speculation.

Context:
{context}

Question:
{question}"""
)

_chain = _prompt | _llm | StrOutputParser()

# ---------- Schema ----------
class Question(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)


# ---------- Route ----------
@router.post("/ask-stream")
async def ask_stream(payload: Question) -> StreamingResponse:
    """
    Streams NDJSON:
      {"chunk": "..."} ... {"done": true}
    """
    if not GOOGLE_API_KEY:
        # Fail fast with a clear message (frontend will show it)
        async def err() -> AsyncIterator[str]:
            yield json.dumps({"error": "GEMINI_API_KEY is not configured on the server."}) + "\n"
        return StreamingResponse(err(), media_type="application/x-ndjson")

    q = (payload.question or "").strip()[:2000]

    async def gen() -> AsyncIterator[str]:
        # Perceived-speed: prime an empty chunk immediately (shows typing state)
        yield json.dumps({"chunk": ""}) + "\n"
        try:
            # Stream tokens/chunks as they arrive
            async for piece in _chain.astream({"context": CONTEXT, "question": q}):
                if piece:
                    yield json.dumps({"chunk": piece}) + "\n"
            yield json.dumps({"done": True}) + "\n"
        except Exception as e:
            # Never throw; stream an error for the UI to show gracefully
            yield json.dumps({"error": str(e)}) + "\n"

    return StreamingResponse(gen(), media_type="application/x-ndjson")
