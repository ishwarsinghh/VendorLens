import os

file_path = 'services/supabase_client.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make get_all_proposals strict
old_get_all = """def get_all_proposals(user_email: str = None) -> list:
    \"\"\"Fetch all proposals with their vendor name and features, filtered by user.\"\"\"
    query = supabase.table("proposals").select("*, vendors(name, contact_email)")
    
    if user_email:
        query = query.eq("user_email", user_email)
        
    proposals = query.execute().data"""

new_get_all = """def get_all_proposals(user_email: str = None) -> list:
    \"\"\"Fetch all proposals with their vendor name and features, filtered by user.\"\"\"
    if not user_email:
        return [] # STRICT ISOLATION: No email = no data, prevent data leaks
        
    query = supabase.table("proposals").select("*, vendors(name, contact_email)")
    query = query.eq("user_email", user_email)
    proposals = query.execute().data"""

content = content.replace(old_get_all, new_get_all)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
