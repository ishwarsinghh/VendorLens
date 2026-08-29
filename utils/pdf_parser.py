import fitz  # PyMuPDF

PRICING_KEYWORDS = [
    "price", "cost", "pricing", "payment", "fee", "invoice",
    "sla", "uptime", "availability", "support", "warranty",
    "feature", "include", "implement", "timeline", "deliverable",
    "penalty", "breach", "contract", "term", "condition"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract full text from PDF bytes."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()
    return full_text

def extract_relevant_pages(file_bytes: bytes, max_chars: int = 6000) -> str:
    """
    Smart extraction: prioritize pages containing pricing/SLA/feature keywords.
    Caps output at max_chars to save LLM tokens.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    scored_pages = []

    for i, page in enumerate(doc):
        text = page.get_text()
        score = sum(1 for kw in PRICING_KEYWORDS if kw in text.lower())
        scored_pages.append((score, i, text))

    doc.close()

    # Sort pages by relevance score (most relevant first)
    scored_pages.sort(key=lambda x: x[0], reverse=True)

    combined = ""
    for _, _, text in scored_pages:
        if len(combined) + len(text) > max_chars:
            remaining = max_chars - len(combined)
            combined += text[:remaining]
            break
        combined += text + "\n\n"

    return combined.strip()
