from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
import json

app = FastAPI()

# Allow your Chrome extension or localhost to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = "YOUR_API_KEY" #replace this with the api key provided
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


@app.post("/evaluate")
async def evaluate_post(payload: dict):
    """
    Expected input:
    {
        "post": "... user draft text ...",
        "rules": "Rule1\nRule2\nRule3 ..."
    }
    """

    raw = payload.get("post", "{}")
    post_obj = json.loads(raw)
    user_post = post_obj.get("full_text", "")

    subreddit_rules = payload.get("rules", "")

    prompt = f"""
Evaluate this draft Reddit post and return a JSON analysis.

Post:
{user_post}

Rules:
{subreddit_rules}

Return EXACTLY this JSON structure. "feedback" should include suggested rewrites or rewordings:
{{
  "rules_broken": [...],
  "feedback": "...",
  "engagement": "high" | "low" | "neutral"
}}
"""

    print("\n=Sending to OpenRouter")
    print(prompt)

    openrouter_payload = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": "You are a helpful AI moderator assistant."},
            {"role": "user", "content": prompt},
        ],
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "Reddit Feedback Extension"
    }

    response = requests.post(
        OPENROUTER_URL,
        headers=headers,
        json=openrouter_payload
    )

    data = response.json()

    if "error" in data:
        return {
            "rules_broken": [],
            "feedback": f"OpenRouter error: {data['error']}"
        }

    # Case 2: No choices in the response
    if "choices" not in data:
        return {
            "rules_broken": [],
            "feedback": f"Unexpected response from OpenRouter: {data}"
        }

    # Extract the assistant response
    raw_output = data["choices"][0]["message"]["content"]


    # Try to parse the returned JSON
    try:
        cleaned = raw_output.replace("'", "\"")
        parsed = json.loads(cleaned)
    except:
        parsed = {"rules_broken": [], "feedback": raw_output}

    print("PARSED RESPONSE: ")
    print(parsed)
    return parsed



# run in terminal:
# cd to reddit-backend
# .\venv\Scripts\activate
# python -m uvicorn app:app --reload --port 5001
