import re

with open('frontend/src/App.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "import Requirements from './pages/Requirements';", 
    "import Requirements from './pages/Requirements';\nimport Playbook from './pages/Playbook';"
)
c = c.replace(
    '<Route path="/requirements" element={<Requirements />} />',
    '<Route path="/requirements" element={<Requirements />} />\n            <Route path="/playbook" element={<Playbook />} />'
)

with open('frontend/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

with open('frontend/src/pages/Analysis.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = re.sub(
    r"const handleGeneratePlaybook = async \(\) => \{.*?finally \{\s*setPlaybookLoading\(false\);\s*\}\s*\};",
    """const navigate = useNavigate();
  const handleGeneratePlaybook = () => {
    navigate('/playbook');
  };""",
    c,
    flags=re.DOTALL
)

c = re.sub(r"<NegotiationModal.*?/>", "", c, flags=re.DOTALL)
c = c.replace("import NegotiationModal from '../components/NegotiationModal';\n", "")
c = c.replace("import { useState, useEffect, useCallback } from 'react';", "import { useState, useEffect, useCallback } from 'react';\nimport { useNavigate } from 'react-router-dom';")

with open('frontend/src/pages/Analysis.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
