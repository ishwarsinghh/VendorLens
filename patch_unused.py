import re

with open('frontend/src/pages/Analysis.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(", generateNegotiationPlaybook", "")
c = re.sub(r"const \[playbook, setPlaybook\].*?\n", "", c)
c = re.sub(r"const \[playbookLoading, setPlaybookLoading\].*?\n", "", c)
c = re.sub(r"const \[playbookError, setPlaybookError\].*?\n", "", c)
c = re.sub(r"const \[isModalOpen, setIsModalOpen\].*?\n", "", c)

with open('frontend/src/pages/Analysis.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
