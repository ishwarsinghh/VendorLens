with open('frontend/src/api.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const res = await fetch(`${API_BASE}/api/compare`);\n  const res = await fetch(`${API_BASE}/api/compare`, { headers: getHeaders() });',
    'const res = await fetch(`${API_BASE}/api/compare`, { headers: getHeaders() });'
)
content = content.replace(
    "const res = await fetch(`${API_BASE}/api/upload`, {\n    method: 'POST',\n    body: formData,\n  });",
    "const res = await fetch(`${API_BASE}/api/upload`, {\n    method: 'POST',\n    headers: getUploadHeaders(),\n    body: formData,\n  });"
)
content = content.replace(
    "const res = await fetch(`${API_BASE}/api/proposals/${id}`, {\n    method: 'DELETE',\n  });",
    "const res = await fetch(`${API_BASE}/api/proposals/${id}`, {\n    method: 'DELETE',\n    headers: getHeaders(),\n  });"
)
content = content.replace(
    "export async function getProposals(): Promise<any> {\n  const res = await fetch(`${API_BASE}/api/proposals`);",
    "export async function getProposals(): Promise<any> {\n  const res = await fetch(`${API_BASE}/api/proposals`, { headers: getHeaders() });"
)


with open('frontend/src/api.ts', 'w', encoding='utf-8') as f:
    f.write(content)
