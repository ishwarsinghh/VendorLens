// ── VendorLens AI — API Client ───────────────────────────────────────────────
// All fetch() calls to the FastAPI backend.

const API_BASE = 'https://vendorlens.onrender.com';

export interface UploadResult {
  proposal_id: string;
  vendor_name: string;
  status: 'success' | 'partial' | 'failed';
  extraction_confidence: number;
  message: string;
}

export interface FeatureItem {
  feature_name: string;
  is_included: boolean;
  notes?: string;
}

export interface ScoreBreakdown {
  cost_score: number;
  sla_score: number;
  feature_score: number;
  speed_score: number;
}

export interface RiskFlag {
  risk_id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface RiskSummary {
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

export interface VendorComparison {
  proposal_id: string;
  vendor_name: string | null;
  total_cost: number | null;
  implementation_time_weeks: number | null;
  sla_uptime: number | null;
  payment_terms: string | null;
  support_level: string | null;
  score: number | null;
  score_breakdown: ScoreBreakdown | null;
  features: FeatureItem[];
  risk_flags: RiskFlag[];
  risk_summary: RiskSummary | null;
  is_recommended: boolean;
  features_included_count: number;
}

export interface CompareResponse {
  vendors: VendorComparison[];
  recommended_vendor: string | null;
  recommendation_reason: string | null;
}

export interface RequirementsInput {
  session_id?: string;
  max_budget?: number | null;
  min_sla_uptime?: number | null;
  max_implementation_weeks?: number | null;
  required_features: string[];
}

export const getHeaders = () => {
  const userStr = localStorage.getItem('vl_user');
  let email = '';
  if (userStr) {
    try { email = JSON.parse(userStr).email; } catch {}
  }
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(email && { 'x-user-email': email })
  };
};

export const getUploadHeaders = () => {
  const userStr = localStorage.getItem('vl_user');
  let email = '';
  if (userStr) {
    try { email = JSON.parse(userStr).email; } catch {}
  }
  return {
    'Accept': 'application/json',
    ...(email && { 'x-user-email': email })
  };
};

// ── Upload PDF ───────────────────────────────────────────────────────────────
export async function uploadProposal(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/upload`);
    
    // Attach user email for backend isolation
    const headers = getUploadHeaders();
    if (headers['x-user-email']) {
      xhr.setRequestHeader('x-user-email', headers['x-user-email']);
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const err = JSON.parse(xhr.responseText);
        reject(new Error(err.detail || `Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

// ── Compare All Proposals ────────────────────────────────────────────────────
export async function compareProposals(): Promise<CompareResponse> {
  const res = await fetch(`${API_BASE}/api/compare`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Compare failed (${res.status})`);
  return res.json();
}

// ── Save Requirements ────────────────────────────────────────────────────────
export async function saveRequirements(data: RequirementsInput): Promise<void> {
  const res = await fetch(`${API_BASE}/api/requirements`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let errText = `Save failed (${res.status})`;
    try {
      const err = await res.json();
      errText = err.detail || errText;
    } catch {
      errText = await res.text();
    }
    throw new Error(errText);
  }
}

// ── Delete Proposal ──────────────────────────────────────────────────────────
export async function deleteProposal(proposalId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/proposals/${proposalId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
}

// ── Generate Negotiation Playbook ────────────────────────────────────────────
export async function generateNegotiationPlaybook(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/negotiate`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Negotiation AI failed (${res.status})`);
  const data = await res.json();
  return data.playbook;
}
