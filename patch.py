import re
with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('from fastapi import FastAPI, UploadFile, File, HTTPException', 'from fastapi import FastAPI, UploadFile, File, HTTPException, Header\nfrom typing import Optional')
content = content.replace('async def upload_proposal(file: UploadFile = File(...)):', 'async def upload_proposal(file: UploadFile = File(...), x_user_email: Optional[str] = Header(None)):')
content = content.replace('from services.supabase_client import (', 'from services.supabase_client import (\n    create_vendor,')

old_insert = """        vendor = upsert_vendor(
            name=extracted.get("vendor_name", file.filename.replace(".pdf", "")),
        )
        proposal = insert_proposal(
            vendor_id=vendor["id"],
            data=extracted,
            raw_text=raw_text,
            confidence=confidence
        )"""

new_insert = """        vendor_name = extracted.get("vendor_name", file.filename.replace(".pdf", ""))
        vendor_id = create_vendor(name=vendor_name, user_email=x_user_email)
        proposal = insert_proposal(
            vendor_id=vendor_id,
            data=extracted,
            raw_text=raw_text,
            confidence=confidence,
            user_email=x_user_email
        )"""

content = content.replace(old_insert, new_insert)
content = content.replace('            "vendor_name":           vendor["name"],', '            "vendor_name":           vendor_name,')
content = content.replace('def list_proposals():', 'def list_proposals(x_user_email: Optional[str] = Header(None)):')
content = content.replace('    proposals = get_all_proposals()', '    proposals = get_all_proposals(user_email=x_user_email)')
content = content.replace('def compare_proposals():', 'def compare_proposals(x_user_email: Optional[str] = Header(None)):')

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)
