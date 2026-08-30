import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

NEGOTIATION_PROMPT = """
You are an expert procurement negotiator. Analyze the following vendor comparison data and generate a strategic negotiation playbook.
The data includes multiple vendors, their costs, SLA, implementation time, features, and risk flags.

Generate a detailed, actionable negotiation strategy in Markdown format. The playbook should include:
1. Executive Summary: A quick overview of the leverage we hold based on the comparison.
2. Vendor-Specific Strategies: For each vendor, provide:
   - Strengths to acknowledge.
   - Weaknesses/Risks to exploit or use as leverage (e.g. missing features, poor SLA, high cost compared to others).
   - Specific questions or demands to make during negotiations.
3. Cross-Vendor Leverage: How to use Vendor A's offer to negotiate a better deal with Vendor B.
4. Next Steps: Concrete actions for the procurement team.

Use clear formatting, bullet points, and bold text for emphasis.
Do not output anything other than the Markdown playbook.

Vendor Comparison Data:
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
            model="openai/gpt-oss-120b",
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
