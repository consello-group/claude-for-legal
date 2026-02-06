'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReviewDashboard from './components/ReviewDashboard';
import AnalysisProgressModal from './components/AnalysisProgressModal';
import NotAContractPage from './components/NotAContractPage';

// FileIcon component for file type badges
const FileIcon = ({ type }) => {
  const colors = { pdf: "#C0392B", docx: "#2E74B5", txt: "#666" };
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="4" y="2" width="16" height="22" rx="2" fill={colors[type] || "#666"} fillOpacity="0.08" stroke={colors[type] || "#666"} strokeWidth="1.2" />
      <path d="M14 2v6h6" stroke={colors[type] || "#666"} strokeWidth="1.2" strokeLinecap="round" />
      <text x="12" y="19" textAnchor="middle" fontSize="6" fontWeight="600" fill={colors[type] || "#666"} fontFamily="DM Sans, Arial, sans-serif">
        {type.toUpperCase()}
      </text>
    </svg>
  );
};

// Demo data for instant demos without API
const DEMO_DATA = {
  green: {
    classification: 'green',
    level: 'GREEN',
    summary: 'Standard Approval',
    document: 'Standard-NDA.txt',
    parties: 'Consello LLC ↔ Acme Corporation',
    type: 'Mutual NDA',
    term: '2 years with 3-year survival',
    governingLaw: 'New York',
    screening: [
      { criterion: 'Mutual Obligations', status: 'pass', note: 'Both parties bound equally' },
      { criterion: 'Term Length', status: 'pass', note: '2 years - within standard range' },
      { criterion: 'Survival Period', status: 'pass', note: '3 years - appropriate' },
      { criterion: 'Public Info Carveout', status: 'pass', note: 'Present and complete' },
      { criterion: 'Prior Possession', status: 'pass', note: 'Properly addressed' },
      { criterion: 'Independent Development', status: 'pass', note: 'Carveout included' },
      { criterion: 'Legal Compulsion', status: 'pass', note: 'Notice requirement included' },
      { criterion: 'Third-Party Receipt', status: 'pass', note: 'Standard carveout present' },
      { criterion: 'Non-Compete Clause', status: 'pass', note: 'None present' },
      { criterion: 'Non-Solicitation', status: 'pass', note: 'None present' },
      { criterion: 'Governing Law', status: 'pass', note: 'New York - preferred jurisdiction' },
      { criterion: 'Remedies', status: 'pass', note: 'Standard injunctive relief' }
    ],
    issues: [],
    recommendation: 'This NDA meets all playbook standards and can be approved via delegation of authority. No escalation required.',
    nextSteps: [
      'Approve NDA via standard delegation',
      'Execute via DocuSign with standard signature blocks',
      'File in contract management system',
      'Set calendar reminder for 2-year expiration'
    ]
  },
  yellow: {
    classification: 'yellow',
    level: 'YELLOW',
    summary: 'Counsel Review Needed',
    document: 'Vendor-NDA-Draft.docx',
    parties: 'Consello LLC ↔ TechVendor Inc.',
    type: 'Mutual NDA',
    term: '3 years with 5-year survival',
    governingLaw: 'California',
    screening: [
      { criterion: 'Mutual Obligations', status: 'pass', note: 'Both parties bound equally' },
      { criterion: 'Term Length', status: 'flag', note: '3 years - at upper limit' },
      { criterion: 'Survival Period', status: 'flag', note: '5 years - above standard' },
      { criterion: 'Public Info Carveout', status: 'pass', note: 'Present and complete' },
      { criterion: 'Prior Possession', status: 'pass', note: 'Properly addressed' },
      { criterion: 'Independent Development', status: 'pass', note: 'Carveout included' },
      { criterion: 'Legal Compulsion', status: 'pass', note: 'Notice requirement included' },
      { criterion: 'Third-Party Receipt', status: 'pass', note: 'Standard carveout present' },
      { criterion: 'Non-Compete Clause', status: 'pass', note: 'None present' },
      { criterion: 'Non-Solicitation', status: 'pass', note: 'None present' },
      { criterion: 'Governing Law', status: 'flag', note: 'California - acceptable but not preferred' },
      { criterion: 'Remedies', status: 'pass', note: 'Standard injunctive relief' }
    ],
    issues: [
      {
        id: 'issue-1',
        severity: 'yellow',
        title: 'Extended Survival Period',
        description: '5-year survival period exceeds our standard 3-year position.',
        risk: 'Longer ongoing obligations post-termination.',
        recommendation: 'Request reduction to 3 years. If pushed back, 4 years is acceptable for strategic vendors.',
        sourceBlockIds: [],
        sourceQuote: ''
      },
      {
        id: 'issue-2',
        severity: 'yellow',
        title: 'California Governing Law',
        description: 'California governing law rather than preferred New York.',
        risk: 'Potentially broader interpretation of confidentiality obligations.',
        recommendation: 'Accept if vendor insists - California is within acceptable jurisdictions per playbook.',
        sourceBlockIds: [],
        sourceQuote: ''
      }
    ],
    recommendation: 'This NDA has minor deviations that should be reviewed by designated counsel before execution. Issues are negotiable and within acceptable ranges.',
    nextSteps: [
      'Route to designated reviewer for approval',
      'Consider negotiating survival period to 3-4 years',
      'Document business justification if accepting California law',
      'Expected turnaround: 1-2 business days'
    ]
  },
  red: {
    classification: 'red',
    level: 'RED',
    summary: 'Escalation Required - Significant Issues',
    document: 'problematic-nda.txt',
    parties: 'Consello LLC (Receiving Party) ← Aggressive Corp (Disclosing Party)',
    type: 'Unilateral NDA (receiving party only)',
    term: 'Perpetual (no expiration)',
    governingLaw: 'Texas (Houston arbitration)',
    screening: [
      { criterion: 'Mutual Obligations', status: 'fail', note: 'Unilateral - we are bound, they are not' },
      { criterion: 'Term Length', status: 'fail', note: 'Perpetual - no defined end date' },
      { criterion: 'Survival Period', status: 'fail', note: 'Perpetual confidentiality obligations' },
      { criterion: 'Public Info Carveout', status: 'pass', note: 'Present' },
      { criterion: 'Prior Possession', status: 'pass', note: 'Present' },
      { criterion: 'Independent Development', status: 'fail', note: 'MISSING - critical carveout absent' },
      { criterion: 'Legal Compulsion', status: 'pass', note: 'Present with notice requirement' },
      { criterion: 'Third-Party Receipt', status: 'pass', note: 'Present' },
      { criterion: 'Non-Compete Clause', status: 'fail', note: '2-year non-compete in their sector' },
      { criterion: 'Non-Solicitation', status: 'fail', note: '3-year employee non-solicitation' },
      { criterion: 'Governing Law', status: 'fail', note: 'Texas with mandatory Houston arbitration' },
      { criterion: 'Remedies', status: 'fail', note: '$500,000 liquidated damages clause' }
    ],
    issues: [
      {
        id: 'issue-1',
        severity: 'red',
        title: 'Unilateral Structure',
        description: 'NDA only binds Consello as receiving party. Counterparty has no confidentiality obligations.',
        risk: 'We cannot share any information requiring protection. Completely one-sided.',
        recommendation: 'Require conversion to mutual NDA or reject.',
        sourceBlockIds: [],
        sourceQuote: ''
      },
      {
        id: 'issue-2',
        severity: 'red',
        title: 'Missing Independent Development Carveout',
        description: 'No protection for independently developed information or ideas.',
        risk: 'Exposure to claims that our internal work infringes their confidential information.',
        recommendation: 'MUST ADD standard independent development carveout. Non-negotiable.',
        sourceBlockIds: [],
        sourceQuote: ''
      },
      {
        id: 'issue-3',
        severity: 'red',
        title: 'Non-Compete Clause (2 years)',
        description: 'Section 8.1 prohibits competing in their sector for 2 years after termination.',
        risk: 'Could prevent legitimate business activities and client relationships.',
        recommendation: 'DELETE ENTIRELY. Non-competes are prohibited in NDAs per playbook.',
        sourceBlockIds: [],
        sourceQuote: ''
      }
    ],
    recommendation: 'DO NOT SIGN. This NDA contains multiple provisions that violate playbook standards and create unacceptable risk. Escalate to senior counsel and provide counterparty with our standard mutual NDA template.',
    nextSteps: [
      'ESCALATE to senior counsel immediately',
      'Prepare detailed counterproposal using Consello standard NDA',
      'Document all issues in contract tracker',
      'Schedule call with counterparty to discuss concerns',
      'Consider whether business relationship justifies negotiation effort'
    ]
  }
};

// Helper function
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function Home() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App state
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [parsedDocument, setParsedDocument] = useState(null);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');

  // View state: 'input' | 'results' | 'not-contract'
  const [viewMode, setViewMode] = useState('input');
  const [analysisPhase, setAnalysisPhase] = useState('parse');
  const [notContractInfo, setNotContractInfo] = useState(null);

  // New UI state
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  // Check for stored auth on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('legal-app-auth');
    if (stored) {
      setIsAuthenticated(true);
      setPassword(stored);
    }
    setMounted(true);
  }, []);

  // Auth handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem('legal-app-auth', password);
        setIsAuthenticated(true);
      } else {
        setAuthError('Invalid password');
      }
    } catch (err) {
      setAuthError('Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Drag handlers for new UI
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // File handling
  const handleFileUpload = useCallback(async (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];

    if (!validExtensions.includes(ext)) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    setSelectedFile(file);
    setSelectedSample(null);
    setCurrentDocument({
      name: file.name,
      size: formatFileSize(file.size),
      rawFile: file,
    });
    setParsedDocument(null);
    setResults(null);
    setError('');
    setViewMode('input');

    if (ext === '.txt') {
      const content = await file.text();
      setDocumentContent(content);
    } else if (ext === '.docx') {
      setIsParsing(true);
      try {
        const buffer = await file.arrayBuffer();
        const res = await fetch(`/api/parse-docx?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-app-password': password,
          },
          body: buffer,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to parse DOCX');
        }

        setParsedDocument(data.document);
        setDocumentContent(data.document.fullText);
      } catch (err) {
        setError(`DOCX parsing failed: ${err.message}`);
        setDocumentContent(`[DOCX parsing error - ${err.message}]`);
      } finally {
        setIsParsing(false);
      }
    } else if (ext === '.pdf') {
      setIsParsing(true);
      try {
        const buffer = await file.arrayBuffer();
        const res = await fetch(`/api/parse-pdf?filename=${encodeURIComponent(file.name)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'x-app-password': password,
          },
          body: buffer,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to parse PDF');
        }

        setParsedDocument(data.document);
        setDocumentContent(data.document.fullText);
      } catch (err) {
        setError(`PDF parsing failed: ${err.message}`);
        setDocumentContent(`[PDF parsing error - ${err.message}]`);
      } finally {
        setIsParsing(false);
      }
    } else {
      setDocumentContent(`[${ext.toUpperCase()} file uploaded - DOC parsing coming soon]`);
    }
  }, [password]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  // Sample selection
  const handleSampleSelect = async (sampleId) => {
    setSelectedSample(sampleId);
    setSelectedFile(null);

    const filename = sampleId === 'standard' ? 'standard-nda.txt' : 'problematic-nda.txt';
    try {
      const res = await fetch(`/sample-ndas/${filename}`);
      const content = await res.text();
      setCurrentDocument({ name: filename, size: formatFileSize(content.length) });
      setDocumentContent(content);
      setParsedDocument(null);
      setResults(null);
      setError('');
      setViewMode('input');
    } catch (err) {
      setError('Could not load sample document');
    }
  };

  // Load sample NDAs (legacy, kept for compatibility)
  const loadSampleNDA = async (type) => {
    await handleSampleSelect(type);
  };

  // Clear document and start fresh
  const startNewDocument = () => {
    setSelectedFile(null);
    setSelectedSample(null);
    setCurrentDocument(null);
    setDocumentContent('');
    setParsedDocument(null);
    setResults(null);
    setError('');
    setViewMode('input');
    setNotContractInfo(null);
  };

  // Run demo (no API call)
  const runDemo = (type) => {
    setResults(DEMO_DATA[type]);
    setViewMode('results');
  };

  // Check if we have a selection
  const hasSelection = selectedFile || selectedSample;

  // Run analysis via API
  const runAnalysis = async () => {
    if (!documentContent) {
      setError('Please upload a document first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisPhase('parse');
    setError('');

    try {
      // Phase 1: Parse (already done if DOCX/PDF)
      setAnalysisPhase('analyze');

      // Use annotated text if we have a parsed document
      const docContent = parsedDocument ? parsedDocument.annotatedText : documentContent;

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-password': password,
        },
        body: JSON.stringify({
          document: docContent,
          filename: currentDocument?.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Check if document is a contract
      if (data.isContract === false) {
        setNotContractInfo({
          documentType: data.documentType,
          reason: data.notContractReason,
          filename: currentDocument?.name,
        });
        setViewMode('not-contract');
        return;
      }

      setAnalysisPhase('identify');

      // Small delay for UX
      await new Promise(r => setTimeout(r, 300));
      setAnalysisPhase('recommend');
      await new Promise(r => setTimeout(r, 300));

      // Set results
      setResults({
        ...data.analysis,
        rawAnalysis: data.rawAnalysis || JSON.stringify(data.analysis, null, 2),
      });
      setViewMode('results');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export report
  const exportReport = () => {
    if (!results) return;
    const html = generateReportHTML(results);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-analysis-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="logo">
            <Image
              src="/consello-logo.jpg"
              alt="Consello"
              width={140}
              height={40}
              className="logo-image"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1>Legal Document Analysis</h1>
          <p>Enter password to access</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="login-input"
              autoFocus
            />
            {authError && <p className="error-text">{authError}</p>}
            <button type="submit" className="btn btn-primary btn-large" disabled={authLoading}>
              {authLoading ? 'Authenticating...' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Not a contract page
  if (viewMode === 'not-contract' && notContractInfo) {
    return (
      <NotAContractPage
        documentType={notContractInfo.documentType}
        reason={notContractInfo.reason}
        filename={notContractInfo.filename}
        onTryAgain={startNewDocument}
      />
    );
  }

  // Results view - use ReviewDashboard
  if (viewMode === 'results' && results) {
    return (
      <ReviewDashboard
        parsedDocument={parsedDocument}
        analysisResult={results}
        onBack={startNewDocument}
        onExport={exportReport}
      />
    );
  }

  // Main input view with new designer UI
  return (
    <>
      {/* Analysis Progress Modal */}
      <AnalysisProgressModal
        isOpen={isAnalyzing}
        currentPhase={analysisPhase}
        documentInfo={parsedDocument?.metadata ? {
          ...parsedDocument.metadata,
          filename: currentDocument?.name,
        } : null}
        onCancel={() => setIsAnalyzing(false)}
      />

      <header className="header">
        <div className="logo">
          <Image
            src="/consello-logo.jpg"
            alt="Consello"
            width={140}
            height={40}
            className="logo-image"
            style={{ objectFit: 'contain' }}
          />
        </div>
        <nav className="nav">
          <Link href="/" className="nav-btn active">Analyze</Link>
          <Link href="/playbook" className="nav-btn">Playbook</Link>
          <Link href="/about" className="nav-btn">About</Link>
        </nav>
        <div className="header-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              sessionStorage.removeItem('legal-app-auth');
              setIsAuthenticated(false);
              setPassword('');
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}>
        {/* Header */}
        <div className={mounted ? "fade-up" : ""} style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
            marginBottom: "12px",
          }}>Contract Analysis</h1>
          <p style={{
            fontSize: "15px",
            color: "#666",
            lineHeight: 1.5,
            maxWidth: "400px",
            margin: "0 auto",
          }}>
            Upload a contract to review against your legal playbook. Get flagged risks, missing clauses, and actionable insights.
          </p>
        </div>

        {/* Upload Card */}
        <div className={mounted ? "fade-up delay-1" : ""} style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid rgba(0,0,0,0.06)",
          padding: "28px",
          marginBottom: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.02)",
        }}>
          {/* Card Header with file type icons */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, margin: 0 }}>Upload Document</h2>
            <div style={{ display: "flex", gap: "6px" }}>
              {["pdf", "docx", "txt"].map(t => <FileIcon key={t} type={t} />)}
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "#A64A30" : selectedFile ? "#000" : "rgba(0,0,0,0.12)"}`,
              borderRadius: "12px",
              padding: selectedFile ? "20px" : "36px 24px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              background: isDragging ? "rgba(166, 74, 48, 0.03)" : selectedFile ? "rgba(0,0,0,0.015)" : "rgba(0,0,0,0.01)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            {selectedFile ? (
              /* --- FILE SELECTED STATE --- */
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 3a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V3z" fill="#fff" fillOpacity="0.9" />
                  </svg>
                </div>
                <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>{selectedFile.name}</div>
                  <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                    {formatFileSize(selectedFile.size)}
                    {isParsing && " · Parsing..."}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); startNewDocument(); }} style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  color: "#999",
                  flexShrink: 0,
                }}>×</button>
              </div>
            ) : (
              /* --- EMPTY STATE --- */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <p style={{ fontSize: "14px", color: "#333", fontWeight: 500, margin: 0 }}>
                  Drag & drop your file here
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#999" }}>or</span>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "13px",
                    color: "#A64A30",
                    fontWeight: 500,
                    padding: "5px 14px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(166, 74, 48, 0.25)",
                    background: "rgba(166, 74, 48, 0.04)",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M4 6l4-4 4 4" stroke="#A64A30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Browse files
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#bbb", marginTop: "8px", margin: "8px 0 0 0" }}>
                  PDF, DOCX, or TXT — up to 25MB
                </p>
              </div>
            )}
          </div>

          {/* Sample Files */}
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontSize: "12px", color: "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
              Or try a sample
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { id: "standard", name: "Standard NDA", desc: "Clean mutual NDA with typical terms" },
                { id: "problematic", name: "Problematic NDA", desc: "Contains several red-flag clauses" },
              ].map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleSelect(sample.id)}
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: "10px",
                    border: selectedSample === sample.id ? "1.5px solid #000" : "1.5px solid rgba(0,0,0,0.08)",
                    background: selectedSample === sample.id ? "rgba(0,0,0,0.02)" : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    fontFamily: "'DM Sans', Arial, sans-serif",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "3px" }}>{sample.name}</div>
                  <div style={{ fontSize: "12px", color: "#888", lineHeight: 1.4 }}>{sample.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className={mounted ? "fade-up delay-2" : ""}>
          <button
            onClick={runAnalysis}
            disabled={!hasSelection || isAnalyzing || isParsing}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "9999px",
              border: "none",
              background: hasSelection && !isParsing ? "#000" : "rgba(0,0,0,0.08)",
              color: hasSelection && !isParsing ? "#fff" : "rgba(0,0,0,0.3)",
              fontSize: "15px",
              fontWeight: 600,
              cursor: hasSelection && !isParsing ? "pointer" : "not-allowed",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              fontFamily: "'DM Sans', Arial, sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: hasSelection && !isParsing ? "0 4px 16px rgba(0,0,0,0.15)" : "none",
            }}
          >
            {isAnalyzing ? (
              <span style={{ animation: "pulse 1.5s infinite" }}>Analyzing...</span>
            ) : isParsing ? (
              <span style={{ animation: "pulse 1.5s infinite" }}>Parsing...</span>
            ) : (
              "Start Analysis"
            )}
          </button>
          {hasSelection && !isParsing && (
            <p style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#A64A30",
              marginTop: "10px",
              fontWeight: 500,
              animation: "fadeIn 0.3s ease",
            }}>
              Powered by Claude
            </p>
          )}
          {error && (
            <p style={{
              textAlign: "center",
              fontSize: "13px",
              color: "#C62828",
              marginTop: "12px",
              fontWeight: 500,
            }}>
              {error}
            </p>
          )}
        </div>

        {/* Value Props */}
        <div className={mounted ? "fade-up delay-3" : ""} style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "36px",
          padding: "0 4px",
        }}>
          {[
            "Identifies risk clauses and unusual terms",
            "Checks against your standard legal playbook",
            "Flags missing protections and suggested edits",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#A64A30" fillOpacity="0.1" />
                <path d="M6 10.5L8.5 13L14 7.5" stroke="#A64A30" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "13px", color: "#555" }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Trust/Security Footer */}
        <div className={mounted ? "fade-up delay-4" : ""} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          marginTop: "32px",
          padding: "16px",
          borderRadius: "10px",
          background: "rgba(166, 74, 48, 0.03)",
          border: "1px solid rgba(166, 74, 48, 0.08)",
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L2.5 4v4c0 3.5 2.3 5.5 5.5 6.5 3.2-1 5.5-3 5.5-6.5V4L8 1.5z" stroke="#A64A30" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M5.5 8.5L7 10l3.5-3.5" stroke="#A64A30" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: "12px", color: "#888" }}>
            Documents are processed securely and not stored after analysis
          </span>
        </div>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Consello. This tool assists with legal workflows but does not constitute legal advice.</p>
      </footer>
    </>
  );
}

// Generate HTML report
function generateReportHTML(results) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Legal Analysis Report - ${results.document || 'Document'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
    .classification { font-size: 24px; font-weight: bold; }
    .classification.green { color: #16a34a; }
    .classification.yellow { color: #ca8a04; }
    .classification.red { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    .issue { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .issue.red { border-left: 4px solid #dc2626; }
    .issue.yellow { border-left: 4px solid #ca8a04; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Legal Analysis Report</h1>
    <p class="classification ${results.classification}">${results.level} - ${results.summary}</p>
    <p><strong>Document:</strong> ${results.document || 'N/A'}</p>
    <p><strong>Parties:</strong> ${results.parties || 'N/A'}</p>
    <p><strong>Type:</strong> ${results.type || 'N/A'}</p>
    <p><strong>Term:</strong> ${results.term || 'N/A'}</p>
    <p><strong>Governing Law:</strong> ${results.governingLaw || 'N/A'}</p>
  </div>

  <h2>Screening Results</h2>
  <table>
    <tr><th>Criterion</th><th>Status</th><th>Notes</th></tr>
    ${results.screening?.map(s => `
      <tr>
        <td>${s.criterion}</td>
        <td>${s.status === 'pass' ? '✓' : s.status === 'flag' ? '⚠' : '✕'}</td>
        <td>${s.note}</td>
      </tr>
    `).join('') || '<tr><td colspan="3">No screening data</td></tr>'}
  </table>

  <h2>Issues Found (${results.issues?.length || 0})</h2>
  ${results.issues?.map(issue => `
    <div class="issue ${issue.severity}">
      <h3>${issue.title}</h3>
      <p><strong>Description:</strong> ${issue.description}</p>
      <p><strong>Risk:</strong> ${issue.risk}</p>
      <p><strong>Recommendation:</strong> ${issue.recommendation}</p>
    </div>
  `).join('') || '<p>No issues found.</p>'}

  <h2>Recommendation</h2>
  <p>${results.recommendation}</p>

  <h2>Next Steps</h2>
  <ul>
    ${results.nextSteps?.map(step => `<li>${step}</li>`).join('') || '<li>Review analysis</li>'}
  </ul>
  <div class="footer">
    <p>This analysis assists with legal workflows but does not constitute legal advice.</p>
    <p><strong>© ${new Date().getFullYear()} Consello</strong></p>
  </div>
</body>
</html>`;
}
