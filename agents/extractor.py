import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

EXTRACTION_PROMPT = """
You are an expert procurement analyst. Extract structured data from the vendor proposal text below.

Return ONLY a valid JSON object with EXACTLY these keys. Do NOT add any explanation, markdown, or extra text.
If a field is not found in the text, use null for that field.

{{
  "vendor_name": "string or null",
  "total_cost": number in USD (no symbols, just the number) or null,
  "implementation_time_weeks": integer or null,
  "sla_uptime": number as percentage e.g. 99.9 or null,
  "payment_terms": "string e.g. Net 30 or null",
  "warranty_months": integer or null,
  "support_level": "string e.g. 24/7 or Business Hours or null",
  "contract_length_months": integer or null,
  "penalties_clause": true or false,
  "features": [
    {{"feature_name": "string", "is_included": true or false, "notes": "string or null"}}
  ]
}}

Vendor Proposal Text:
{proposal_text}
"""

def extract_proposal_data(proposal_text: str, retries: int = 3) -> dict:
    """
    Call Groq LLM to extract structured data from proposal text.
    Retries up to 3 times on parse failure.
    """
    for attempt in range(retries):
        try:
            response = client.chat.completions.create(
                model="llama-3.1-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a precise data extraction agent. Always return valid JSON only. No markdown, no explanation."
                    },
                    {
                        "role": "user",
                        "content": EXTRACTION_PROMPT.format(proposal_text=proposal_text)
                    }
                ],
                temperature=0.1,  # Low temp = more deterministic output
                max_tokens=1500,
            )

            raw = response.choices[0].message.content.strip()

            # Strip markdown code blocks if model wraps response
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            return json.loads(raw)

        except json.JSONDecodeError as e:
            print(f"[Extractor] JSON parse failed on attempt {attempt + 1}: {e}")
            if attempt == retries - 1:
                raise ValueError(f"Failed to extract valid JSON after {retries} attempts.")

    return {}
