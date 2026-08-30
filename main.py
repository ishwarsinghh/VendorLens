import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from agents.extractor import extract_proposal_data
from agents.validator import validate_and_fill, calculate_confidence
from agents.scorer import calculate_scores, get_recommendation_reason
from agents.risk_analyzer import analyze_risks
from agents.negotiator import generate_playbook
from services.supabase_client import (
    create_vendor,
    upsert_vendor, insert_proposal, insert_features,
    get_all_proposals, delete_proposal,
    upsert_requirements, get_requirements
)
from models.schemas import RequirementsInput, CompareResponse
from utils.pdf_parser import extract_relevant_pages, extract_text_from_pdf

load_dotenv()

app = FastAPI(title="VendorLens AI API", version="1.0.0")

# ─── CORS (allow Lovable frontend to call this API) ───────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Lock down to your Lovable URL before production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 1: Upload & Extract PDF
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/upload")
async def upload_proposal(file: UploadFile = File(...), x_user_email: Optional[str] = Header(None)):
    """
    Upload a vendor PDF.
    Extracts structured data using Groq, validates, saves to Supabase.
    """
    try:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

        # Step 1: Parse PDF
        file_bytes = await file.read()
        raw_text = extract_text_from_pdf(file_bytes)
        smart_text = extract_relevant_pages(file_bytes)

        # Step 2: Extract with Groq
        try:
            extracted = extract_proposal_data(smart_text)
        except ValueError as e:
            raise HTTPException(status_code=422, detail=f"Extraction failed: {str(e)}")

        # Step 3: Validate & recover missing fields
        extracted = validate_and_fill(extracted, raw_text)

        # Step 4: Calculate confidence score
        confidence = calculate_confidence(extracted)

        # Step 5: Save to Supabase
        vendor_name = extracted.get("vendor_name", file.filename.replace(".pdf", ""))
        vendor_id = create_vendor(name=vendor_name, user_email=x_user_email)
        proposal = insert_proposal(
            vendor_id=vendor_id,
            data=extracted,
            raw_text=raw_text,
            confidence=confidence,
            user_email=x_user_email
        )
        insert_features(
            proposal_id=proposal["id"],
            features=extracted.get("features", [])
        )

        return {
            "proposal_id":           proposal["id"],
            "vendor_name":           vendor_name,
            "status":                "success" if confidence >= 0.6 else "partial",
            "extraction_confidence": confidence,
            "message":               f"Extracted {int(confidence * 100)}% of expected fields."
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"UPLOAD ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 2: Get All Proposals (raw list)
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/proposals")
def list_proposals(x_user_email: Optional[str] = Header(None)):
    """List all uploaded proposals from Supabase."""
    proposals = get_all_proposals(user_email=x_user_email)
    return {"proposals": proposals, "count": len(proposals)}


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 3: Compare & Score All Proposals
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/compare")
def compare_proposals(x_user_email: Optional[str] = Header(None)):
    """
    Fetch all proposals, score them deterministically,
    run risk analysis, and return a ranked comparison.
    """
    proposals = get_all_proposals(user_email=x_user_email)

    if not proposals:
        return CompareResponse(
            vendors=[],
            recommended_vendor=None,
            recommendation_reason="No proposals uploaded yet."
        )

    # Score vendors (deterministic math — no LLM)
    scored = calculate_scores(proposals)

    # Analyze risks
    final = analyze_risks(scored)

    # Top recommendation
    recommended = final[0]["vendor_name"] if final else None
    reason = get_recommendation_reason(final)

    return {
        "vendors": final,
        "recommended_vendor": recommended,
        "recommendation_reason": reason
    }


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 4: Set Requirements
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/requirements")
def set_requirements(req: RequirementsInput):
    """Save procurement requirements (budget, SLA, features)."""
    result = upsert_requirements(session_id=req.session_id, data=req.dict())
    return {"status": "saved", **result}


@app.get("/api/requirements/{session_id}")
def fetch_requirements(session_id: str = "default"):
    """Fetch saved requirements for a session."""
    return get_requirements(session_id)


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 5: Delete a Proposal
# ─────────────────────────────────────────────────────────────────────────────

@app.delete("/api/proposals/{proposal_id}")
def remove_proposal(proposal_id: str):
    """Delete a vendor proposal and its associated data."""
    success = delete_proposal(proposal_id)
    if success:
        return {"status": "deleted", "proposal_id": proposal_id}
    raise HTTPException(status_code=404, detail="Proposal not found.")


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINT 6: Generate Negotiation Playbook
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/api/negotiate")
def negotiate_proposals():
    """
    Generate an AI-powered negotiation playbook based on current proposals.
    """
    proposals = get_all_proposals()
    
    if not proposals:
        return {"playbook": "No proposals uploaded yet to generate a playbook."}
        
    # Score vendors and run risk analysis first to get the same data the frontend sees
    scored = calculate_scores(proposals)
    final_data = analyze_risks(scored)
    
    playbook_md = generate_playbook(final_data)
    
    return {"playbook": playbook_md}


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {"status": "VendorLens AI is running 🚀", "version": "1.0.0"}
