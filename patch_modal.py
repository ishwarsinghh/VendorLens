import re

with open('frontend/src/pages/Analysis.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Add Modal Import
c = c.replace("import { useState, useEffect, useCallback, useRef } from 'react';\nimport ReactMarkdown from 'react-markdown';", "import { useState, useEffect, useCallback } from 'react';\nimport NegotiationModal from '../components/NegotiationModal';")
c = c.replace("const playbookRef = useRef<HTMLDivElement>(null);", "const [isModalOpen, setIsModalOpen] = useState(false);")

# Change handleGeneratePlaybook
c = re.sub(
    r"const handleGeneratePlaybook = async \(\) => \{.*?finally \{\s*setPlaybookLoading\(false\);\s*\}\s*\};",
    """const handleGeneratePlaybook = async () => {
    setIsModalOpen(true);
    if (playbook) return; // Already generated

    setPlaybookLoading(true);
    setPlaybookError(null);
    try {
      const result = await generateNegotiationPlaybook();
      setPlaybook(result);
    } catch (err) {
      setPlaybookError(err instanceof Error ? err.message : 'Failed to generate playbook');
    } finally {
      setPlaybookLoading(false);
    }
  };""",
    c,
    flags=re.DOTALL
)

# Replace the inline div with the Modal component
c = re.sub(
    r"\{\(playbook \|\| playbookLoading \|\| playbookError\) && \(.*?\)\}",
    """<NegotiationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        playbook={playbook} 
        loading={playbookLoading} 
        error={playbookError} 
      />""",
    c,
    flags=re.DOTALL
)

with open('frontend/src/pages/Analysis.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
