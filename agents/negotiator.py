import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

NEGOTIATION_PROMPT = """
You are a sharp, executive-level procurement negotiator. Analyze the vendor data and generate a highly concise, punchy negotiation playbook.

Structure the playbook exactly like this (use beautiful Markdown):

# 🎯 Negotiation Strategy

## 📊 The Leverage Summary
(2-3 sentences max. What is our core advantage here?)

## 🤝 Vendor Gameplans
(For each vendor, give exactly 3 bullet points):
* **Where they win:** (Their strongest point)
* **The Leverage:** (Their biggest weakness or highest cost compared to competitors)
* **The Ask:** (Exactly what to demand in the meeting)

## ⚔ Cross-Leverage
(1-2 sentences on how to pit them against each other)

**RULES:**
- Be extremely brief and direct. No fluff. No corporate jargon.
- Use emojis for sections.
- Keep it under 300 words total.

Data:
{comparison_data}
"""

def generate_playbook(comparison_data: dict) -> str:
    """
    Call Groq LLM to generate a negotiation playbook from the comparison data.
    """
    try:
        # Convert the comparison data to a nicely formatted JSON string for the prompt
        data_str = json.dumps(comparison_data, indent=2)
        
        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a senior procurement negotiation strategist. Output only Markdown text."
                },
                {
                    "role": "user",
                    "content": NEGOTIATION_PROMPT.format(comparison_data=data_str)
                }
            ],
            temperature=0.3, # Slightly higher temperature for creative strategy generation
            max_tokens=2000,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"[Negotiator] Failed to generate playbook: {e}")
        return "Failed to generate negotiation playbook. Please try again later."
