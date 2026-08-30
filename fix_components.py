import re

def replace_in_file(path, old, new):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old in content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content.replace(old, new))

replace_in_file('frontend/src/pages/Dashboard.tsx',
    "fetch('https://vendorlens.onrender.com/api/proposals')",
    "fetch('https://vendorlens.onrender.com/api/proposals', { headers: (await import('../api')).getHeaders() })"
)

replace_in_file('frontend/src/pages/History.tsx',
    "fetch('https://vendorlens.onrender.com/api/proposals')",
    "fetch('https://vendorlens.onrender.com/api/proposals', { headers: (await import('../api')).getHeaders() })"
)

with open('frontend/src/pages/Upload.tsx', 'r', encoding='utf-8') as f:
    up = f.read()

up = up.replace("import { uploadProposal, compareProposals, deleteProposal", "import { getHeaders, uploadProposal, compareProposals, deleteProposal")
up = up.replace("fetch('https://vendorlens.onrender.com/api/proposals')", "fetch('https://vendorlens.onrender.com/api/proposals', { headers: getHeaders() })")
up = up.replace("fetch(`https://vendorlens.onrender.com/api/proposals/${p.id}`, { method: 'DELETE' });", "fetch(`https://vendorlens.onrender.com/api/proposals/${p.id}`, { method: 'DELETE', headers: getHeaders() });")

up = up.replace(
    "const result = await compareProposals();\n      setComparison(result);\n      addToast('success', `Analysis complete! ${result.vendors.length} vendors compared.`);",
    "window.location.href = '/analysis';"
)

with open('frontend/src/pages/Upload.tsx', 'w', encoding='utf-8') as f:
    f.write(up)
