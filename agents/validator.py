import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

REQUIRED_FIELDS = ["vendor_name", "total_cost", "sla_uptime"]

RETRY_PROMPT = """
The previous extraction missed these fields: {missing_fields}

Search ONLY for these fields in the text below and return a JSON object with just those keys.
If still not found, return null for that key.

Text:
{proposal_text}
"""

def validate_and_fill(extracted: dict, raw_text: str) -> dict:
    """
    Check for missing required fields.
    If any are missing, re-prompt Groq targeting only those fields.
    Returns merged, completed extraction dict.
    """
    missing = [f for f in REQUIRED_FIELDS if extracted.get(f) is None]

    if not missing:
        print("[Validator] All required fields present. ✅")
        return extracted

    print(f"[Validator] Missing fields: {missing}. Re-prompting...")

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise data extraction agent. Return valid JSON only."
                },
                {
                    "role": "user",
                    "content": RETRY_PROMPT.format(
                        missing_fields=", ".join(missing),
                        proposal_text=raw_text[:4000]
                    )
                }
            ],
            temperature=0.1,
            max_tokens=500,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        recovered = json.loads(raw)

        # Merge recovered fields into original extraction
        for field in missing:
            if recovered.get(field) is not None:
                extracted[field] = recovered[field]
                print(f"[Validator] Recovered field: {field} = {recovered[field]}")

    except Exception as e:
        print(f"[Validator] Recovery attempt failed: {e}")

    return extracted

def calculate_confidence(extracted: dict) -> float:
    """
    Returns a 0.0–1.0 confidence score based on how many fields were found.
    """
    all_fields = [
        "vendor_name", "total_cost", "implementation_time_weeks",
        "sla_uptime", "payment_terms", "warranty_months",
        "support_level", "contract_length_months", "penalties_clause"
    ]
    found = sum(1 for f in all_fields if extracted.get(f) is not None)
    return round(found / len(all_fields), 2)
