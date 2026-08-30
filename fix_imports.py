
def replace_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    if 'import { getHeaders }' not in c:
        c = c.replace('import { useState', 'import { getHeaders } from \\'../api\\';\\nimport { useState')
    c = c.replace('(await import(\\'../api\\')).getHeaders()', 'getHeaders()')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)

replace_file('frontend/src/pages/Dashboard.tsx')
replace_file('frontend/src/pages/History.tsx')

