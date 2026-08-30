import re

with open('frontend/src/pages/Analysis.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Imports
c = c.replace("import { useState, useEffect, useCallback } from 'react';", "import { useState, useEffect, useCallback, useRef } from 'react';\nimport ReactMarkdown from 'react-markdown';")
c = c.replace("import NegotiationModal from '../components/NegotiationModal';\n", "")

# Refs
c = c.replace("const { toasts, addToast, dismiss } = useToast();", "const { toasts, addToast, dismiss } = useToast();\n  const playbookRef = useRef<HTMLDivElement>(null);")

# Generate function
old_gen = """  const handleGeneratePlaybook = async () => {
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
  };"""

new_gen = """  const handleGeneratePlaybook = async () => {
    if (playbook) {
      playbookRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setPlaybookLoading(true);
    setPlaybookError(null);
    setTimeout(() => playbookRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    try {
      const result = await generateNegotiationPlaybook();
      setPlaybook(result);
    } catch (err) {
      setPlaybookError(err instanceof Error ? err.message : 'Failed to generate playbook');
    } finally {
      setPlaybookLoading(false);
    }
  };"""
c = c.replace(old_gen, new_gen)

# JSX replacement
old_jsx = """      <NegotiationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        playbook={playbook} 
        loading={playbookLoading} 
        error={playbookError} 
      />"""

new_jsx = """      {(playbook || playbookLoading || playbookError) && (
        <div ref={playbookRef} style={{ marginTop: 64, padding: 32, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--brand)', marginBottom: 24, fontSize: 24 }}>🤖 AI Negotiation Playbook</h2>
          
          {playbookLoading && (
            <div className="loading-center" style={{ padding: 40 }}>
              <span className="spinner" style={{ width: 40, height: 40 }}></span>
              <p style={{ marginTop: 16 }}>Analyzing vendor differences and crafting strategy...</p>
            </div>
          )}

          {playbookError && (
            <div className="alert-box alert-danger">
              ⚠ {playbookError}
            </div>
          )}

          {!playbookLoading && !playbookError && playbook && (
            <div className="markdown-body playbook-content" style={{ fontSize: 16, lineHeight: 1.6 }}>
              <ReactMarkdown>{playbook}</ReactMarkdown>
            </div>
          )}
        </div>
      )}"""

c = c.replace(old_jsx, new_jsx)

with open('frontend/src/pages/Analysis.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
