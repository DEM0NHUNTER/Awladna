# BackEnd/Utils/ai_integration.py

import os
import logging
import httpx
import re
from datetime import date
from typing import Dict, Any, List, Optional
from textblob import TextBlob
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logger = logging.getLogger(__name__)
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

# Environment configuration
HF_TOKEN = os.getenv("HF_TOKEN")
AI_BASE_URL = os.getenv("AI_BASE_URL", "").rstrip("/")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-70b-8192")


def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Perform basic sentiment analysis using TextBlob.
    Returns polarity (-1 to 1) and label.
    """
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    label = "positive" if polarity > 0.2 else "negative" if polarity < -0.2 else "neutral"
    return {"polarity": polarity, "label": label}


def extract_actions(text: str) -> List[str]:
    """
    Extract up to 3 actionable bullet points or numbered steps from the text.
    """
    matches = re.findall(r"(?:•|\d+\.)\s*(.*?)(?=\n|$)", text)
    return [m.strip() for m in matches[:3]]


def extract_recommendations_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Parse AI response text to extract recommendations.
    """
    pattern = r"Recommendation:\s*(.+)"
    matches = re.findall(pattern, text)
    recs = []
    for m in matches:
        recs.append({
            "title": m[:40] + "..." if len(m) > 43 else m,
            "description": m,
            "priority": "medium",
            "type": "behavior",
            "source": "ai_model",
            "effective_date": date.today()
        })
    return recs


async def _call_custom_api(prompt: str, age: int, name: str, context: str) -> str:
    """
    Attempt response generation from your custom AI endpoint.
    """
    if not AI_BASE_URL:
        raise RuntimeError("AI_BASE_URL not set")

    url = f"{AI_BASE_URL}/generate"
    payload = {"prompt": prompt, "age": age, "name": name, "context": context}
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        text = data.get("text") or data.get("response") or ""
        if not text:
            raise ValueError("Empty response from custom AI endpoint")
        return text.strip()


async def _call_groq(prompt: str, age: int, name: str, context: str) -> str:
    """
    Fallback to Groq API for OpenAI-compatible chat completions.
    """
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not set")

    messages = [
        {"role": "system", "content": "You are a helpful parenting assistant."},
        {"role": "user", "content": f"Child: {name}, Age: {age}\nContext: {context}\nQuestion: {prompt}"}
    ]

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()


async def get_ai_response(
    user_input: str,
    child_age: Optional[int] = None,
    child_name: Optional[str] = None,
    context: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main AI integration entrypoint.
    Attempts to generate response via custom API, falling back to Groq API.
    Returns:
        {
            response: str,
            sentiment_score: float,
            sentiment: str,
            suggested_actions: List[str],
            ai_recommendations: List[Dict]
        }
    """
    logger.info("Generating AI response...")
    prompt = user_input
    if child_age is not None:
        prompt += f" (Child Age: {child_age})"
    if child_name:
        prompt += f" (Child Name: {child_name})"
    if context:
        prompt += f" (Context: {context})"

    try:
        # Uncomment below to attempt using custom API first
        # text = await _call_custom_api(prompt, child_age, child_name, context or "")
        # logger.info("AI response from custom endpoint.")
        # return build_response(text)

        # Direct fallback to Groq (safer for now)
        text = await _call_groq(prompt, child_age, child_name, context or "")
        logger.info("AI response from Groq API.")
    except Exception as err:
        logger.error("AI response generation failed: %s", err, exc_info=True)
        return {
            "response": "I'm having trouble responding right now. Please try again later.",
            "sentiment_score": 0.0,
            "sentiment": "neutral",
            "suggested_actions": [],
            "ai_recommendations": []
        }

    sentiment = analyze_sentiment(text)
    actions = extract_actions(text)
    ai_recs = extract_recommendations_from_text(text)

    return {
        "response": text,
        "sentiment_score": sentiment["polarity"],
        "sentiment": sentiment["label"],
        "suggested_actions": actions,
        "ai_recommendations": ai_recs
    }
