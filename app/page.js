'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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
        severity: 'yellow',
        title: 'Extended Survival Period',
        description: '5-year survival period exceeds our standard 3-year position.',
        risk: 'Longer ongoing obligations post-termination.',
        recommendation: 'Request reduction to 3 years. If pushed back, 4 years is acceptable for strategic vendors.'
      },
      {
        severity: 'yellow',
        title: 'California Governing Law',
        description: 'California governing law rather than preferred New York.',
        risk: 'Potentially broader interpretation of confidentiality obligations.',
        recommendation: 'Accept if vendor insists - California is within acceptable jurisdictions per playbook.'
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
        severity: 'red',
        title: 'Unilateral Structure',
        description: 'NDA only binds Consello as receiving party. Counterparty has no confidentiality obligations.',
        risk: 'We cannot share any information requiring protection. Completely one-sided.',
        recommendation: 'Require conversion to mutual NDA or reject.'
      },
      {
        severity: 'red',
        title: 'Missing Independent Development Carveout',
        description: 'No protection for independently developed information or ideas.',
        risk: 'Exposure to claims that our internal work infringes their confidential information.',
        recommendation: 'MUST ADD standard independent development carveout. Non-negotiable.'
      },
      {
        severity: 'red',
        title: 'Non-Compete Clause (2 years)',
        description: 'Section 8.1 prohibits competing in their sector for 2 years after termination.',
        risk: 'Could prevent legitimate business activities and client relationships.',
        recommendation: 'DELETE ENTIRELY. Non-competes are prohibited in NDAs per playbook.'
      },
      {
        severity: 'red',
        title: 'Non-Solicitation Clause (3 years)',
        description: 'Section 8.2 prohibits hiring their employees for 3 years.',
        risk: 'Restricts talent acquisition; creates litigation risk.',
        recommendation: 'DELETE ENTIRELY. Non-solicitation is prohibited in NDAs.'
      },
      {
        severity: 'red',
        title: 'Perpetual Confidentiality',
        description: 'No termination date; obligations continue forever.',
        risk: 'Indefinite administrative burden and legal exposure.',
        recommendation: 'Require defined term (2-3 years) with reasonable survival period (3-5 years).'
      },
      {
        severity: 'red',
        title: 'Liquidated Damages ($500,000)',
        description: 'Section 12 specifies $500,000 per breach regardless of actual damages.',
        risk: 'Disproportionate exposure; creates significant risk.',
        recommendation: 'DELETE. Standard remedies (injunctive relief + actual damages) are appropriate.'
      },
      {
        severity: 'red',
        title: 'Mandatory Arbitration (Houston)',
        description: 'Disputes must be resolved through binding arbitration in Houston, Texas.',
        risk: 'Inconvenient venue; limited appeal rights.',
        recommendation: 'Require New York courts or neutral arbitration location.'
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

export default function Home() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App state
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [analysisType, setAnalysisType] = useState('nda-triage');
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // Check for stored auth on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('legal-app-auth');
    if (stored) {
      setIsAuthenticated(true);
      setPassword(stored);
    }
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

  // File handling
  const handleFileUpload = useCallback(async (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx', '.txt'];

    if (!validExtensions.includes(ext)) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    setCurrentDocument({
      name: file.name,
      size: formatFileSize(file.size),
    });

    if (ext === '.txt') {
      const content = await file.text();
      setDocumentContent(content);
    } else {
      setDocumentContent(`[${ext.toUpperCase()} file uploaded - ready for analysis]`);
      // For PDF/DOCX, we'd need additional processing
      // For now, we'll show a message about text extraction
    }
    setError('');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  // Load sample NDAs
  const loadSampleNDA = async (type) => {
    const filename = type === 'standard' ? 'standard-nda.txt' : 'problematic-nda.txt';
    try {
      const res = await fetch(`/sample-ndas/${filename}`);
      const content = await res.text();
      setCurrentDocument({ name: filename, size: formatFileSize(content.length) });
      setDocumentContent(content);
      setError('');
    } catch (err) {
      setError('Could not load sample document');
    }
  };

  // Clear document
  const clearDocument = () => {
    setCurrentDocument(null);
    setDocumentContent('');
  };

  // Run demo (no API call)
  const runDemo = (type) => {
    setResults(DEMO_DATA[type]);
  };

  // Run real analysis via API
  const runAnalysis = async () => {
    if (!documentContent) {
      setError('Please upload a document first');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-password': password,
        },
        body: JSON.stringify({
          document: documentContent,
          analysisType,
          filename: currentDocument?.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Parse the markdown response into structured data
      const parsed = parseAnalysisResponse(data.analysis);
      setResults(parsed);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Parse Claude's markdown response into structured data
  const parseAnalysisResponse = (text) => {
    let classification = 'unknown';
    let level = 'UNKNOWN';
    let summary = 'Analysis Complete';

    if (text.includes('GREEN') || text.includes('🟢')) {
      classification = 'green';
      level = 'GREEN';
      summary = 'Standard Approval';
    } else if (text.includes('YELLOW') || text.includes('🟡')) {
      classification = 'yellow';
      level = 'YELLOW';
      summary = 'Counsel Review Needed';
    } else if (text.includes('RED') || text.includes('🔴')) {
      classification = 'red';
      level = 'RED';
      summary = 'Escalation Required';
    }

    const extract = (pattern) => {
      const match = text.match(pattern);
      return match ? match[1].trim() : '—';
    };

    // Parse screening results from table
    const screening = [];
    const screeningMatches = text.matchAll(/\|\s*([^|]+?)\s*\|\s*(✅|⚠️|❌|PASS|FLAG|FAIL)\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|/g);
    for (const match of screeningMatches) {
      const criterion = match[1].trim();
      const statusText = match[2].trim();
      const note = (match[3] || match[4] || '').trim();
      if (criterion && !criterion.includes('Criterion') && !criterion.includes('---')) {
        let status = 'pass';
        if (statusText.includes('⚠') || statusText.includes('FLAG')) status = 'flag';
        if (statusText.includes('❌') || statusText.includes('FAIL')) status = 'fail';
        screening.push({ criterion, status, note });
      }
    }

    // Parse issues
    const issues = [];
    const issueMatches = text.matchAll(/###\s*Issue\s*\d+\s*[—-]\s*(YELLOW|RED|🟡|🔴):?\s*(.+?)(?:\n)/gi);
    for (const match of issueMatches) {
      const severity = match[1].toLowerCase().includes('red') ? 'red' : 'yellow';
      const title = match[2].trim();

      // Try to extract what/risk/recommendation for this issue
      const issueIndex = text.indexOf(match[0]);
      const nextIssueIndex = text.indexOf('### Issue', issueIndex + 10);
      const issueSection = text.substring(issueIndex, nextIssueIndex > 0 ? nextIssueIndex : issueIndex + 1000);

      const whatMatch = issueSection.match(/\*\*What\*\*:?\s*(.+?)(?:\n|$)/);
      const riskMatch = issueSection.match(/\*\*Risk\*\*:?\s*(.+?)(?:\n|$)/);
      const recMatch = issueSection.match(/\*\*Recommendation\*\*:?\s*(.+?)(?:\n|$)/);

      issues.push({
        severity,
        title,
        description: whatMatch ? whatMatch[1].trim() : '',
        risk: riskMatch ? riskMatch[1].trim() : '',
        recommendation: recMatch ? recMatch[1].trim() : ''
      });
    }

    // Extract recommendation section
    const recSectionMatch = text.match(/##\s*Recommendation\s*\n\n?([\s\S]*?)(?=\n##|$)/i);
    const recommendation = recSectionMatch ? recSectionMatch[1].trim().split('\n')[0] : '';

    // Extract next steps
    const nextSteps = [];
    const stepsMatch = text.match(/##\s*Next Steps\s*\n\n?([\s\S]*?)(?=\n##|---|\*This|$)/i);
    if (stepsMatch) {
      const stepLines = stepsMatch[1].match(/^\d+\.\s*(.+)$/gm) || [];
      stepLines.forEach(line => {
        nextSteps.push(line.replace(/^\d+\.\s*/, '').trim());
      });
    }

    return {
      classification,
      level,
      summary,
      document: currentDocument?.name || extract(/\*\*Document\*\*:?\s*(.+?)(?:\n|$)/i),
      parties: extract(/\*\*Parties\*\*:?\s*(.+?)(?:\n|$)/i),
      type: extract(/\*\*Type\*\*:?\s*(.+?)(?:\n|$)/i),
      term: extract(/\*\*Term\*\*:?\s*(.+?)(?:\n|$)/i),
      governingLaw: extract(/\*\*Governing Law\*\*:?\s*(.+?)(?:\n|$)/i),
      screening: screening.length > 0 ? screening : [{ criterion: 'Analysis Complete', status: 'pass', note: 'See details below' }],
      issues,
      recommendation: recommendation || 'See analysis details above.',
      nextSteps: nextSteps.length > 0 ? nextSteps : ['Review analysis', 'Take appropriate action'],
      rawAnalysis: text
    };
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
            <div className="logo-box"></div>
            <span className="logo-text">CONSELLO</span>
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

  // Main app
  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-box"></div>
          <span className="logo-text">CONSELLO</span>
        </div>
        <nav className="nav">
          <button className="nav-btn active">Analyze</button>
        </nav>
        <div className="header-actions">
          <Link href="/about" className="btn btn-ghost btn-sm">About</Link>
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

      <main className="main">
        <section className="hero">
          <h1>Legal Document Analysis</h1>
          <p className="subtitle">AI-powered NDA triage and contract review</p>
        </section>

        <div className="app-container">
          {/* Left Panel: Document Input */}
          <div className="panel panel-input">
            <div className="panel-header">
              <h2>Document</h2>
              <div className="panel-actions">
                <button className="btn btn-sm btn-ghost" onClick={() => loadSampleNDA('standard')}>
                  Standard NDA
                </button>
                <button className="btn btn-sm btn-ghost" onClick={() => loadSampleNDA('problematic')}>
                  Problem NDA
                </button>
              </div>
            </div>

            {!currentDocument ? (
              <div
                className="upload-zone"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <div className="upload-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4L24 32M24 4L16 12M24 4L32 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 28V40C8 41.1 8.9 42 10 42H38C39.1 42 40 41.1 40 40V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="upload-text">Drop document here or click to upload</p>
                <span className="file-types">PDF, DOCX, TXT</span>
                <input
                  type="file"
                  id="fileInput"
                  accept=".pdf,.docx,.doc,.txt"
                  hidden
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="document-preview">
                <div className="document-header">
                  <div className="document-info">
                    <span className="document-icon">📄</span>
                    <div>
                      <span className="document-name">{currentDocument.name}</span>
                      <span className="document-meta">{currentDocument.size}</span>
                    </div>
                  </div>
                  <button className="btn-icon-small" onClick={clearDocument}>✕</button>
                </div>
                <div className="document-content">
                  {documentContent.substring(0, 2000)}
                  {documentContent.length > 2000 && '\n\n[Preview truncated...]'}
                </div>
              </div>
            )}

            <div className="analysis-type-selector">
              <h3>Analysis Type</h3>
              <div className="type-options">
                <label
                  className={`type-option ${analysisType === 'nda-triage' ? 'selected' : ''}`}
                  onClick={() => setAnalysisType('nda-triage')}
                >
                  <div className="type-icon green">⚡</div>
                  <div className="type-info">
                    <span className="type-name">NDA Triage</span>
                    <span className="type-desc">Fast screening</span>
                  </div>
                </label>
                <label
                  className={`type-option ${analysisType === 'contract-review' ? 'selected' : ''}`}
                  onClick={() => setAnalysisType('contract-review')}
                >
                  <div className="type-icon blue">📋</div>
                  <div className="type-info">
                    <span className="type-name">Contract Review</span>
                    <span className="type-desc">Deep analysis</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              className="btn btn-primary btn-large btn-analyze"
              onClick={runAnalysis}
              disabled={isAnalyzing || !currentDocument}
            >
              {isAnalyzing ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                'Analyze with Claude'
              )}
            </button>

            {error && <p className="error-text" style={{ marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
          </div>

          {/* Right Panel: Results */}
          <div className="panel panel-results">
            <div className="panel-header">
              <h2>Analysis Results</h2>
              {results && (
                <div className="panel-actions">
                  <button className="btn btn-sm btn-ghost" onClick={() => navigator.clipboard.writeText(results.rawAnalysis || JSON.stringify(results, null, 2))}>
                    Copy
                  </button>
                  <button className="btn btn-sm btn-primary" onClick={exportReport}>
                    Export
                  </button>
                </div>
              )}
            </div>

            {!results ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="#E0E0E0" strokeWidth="2" strokeDasharray="4 4"/>
                    <path d="M24 32h16M32 24v16" stroke="#BDBDBD" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>No Analysis Yet</h3>
                <p>Upload a document or try a demo</p>
                <div className="demo-buttons">
                  <button className="demo-btn green" onClick={() => runDemo('green')}>
                    <span className="demo-indicator"></span>
                    GREEN Demo
                  </button>
                  <button className="demo-btn yellow" onClick={() => runDemo('yellow')}>
                    <span className="demo-indicator"></span>
                    YELLOW Demo
                  </button>
                  <button className="demo-btn red" onClick={() => runDemo('red')}>
                    <span className="demo-indicator"></span>
                    RED Demo
                  </button>
                </div>
              </div>
            ) : (
              <div className="results-display">
                {/* Classification Badge */}
                <div className="classification-hero">
                  <div className={`classification-badge ${results.classification}`}>
                    <span className="badge-icon">
                      {results.classification === 'green' ? '✓' : results.classification === 'yellow' ? '⚠' : '✕'}
                    </span>
                    <div className="badge-content">
                      <span className="badge-level">{results.level}</span>
                      <span className="badge-text">{results.summary}</span>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="result-meta">
                  <div className="meta-item">
                    <span className="meta-label">Document</span>
                    <span className="meta-value">{results.document}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Parties</span>
                    <span className="meta-value">{results.parties}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Type</span>
                    <span className="meta-value">{results.type}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Term</span>
                    <span className="meta-value">{results.term}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Governing Law</span>
                    <span className="meta-value">{results.governingLaw}</span>
                  </div>
                </div>

                {/* Screening Results */}
                <div className="result-section">
                  <div className="section-header">
                    <h3>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                      </svg>
                      Screening Results
                    </h3>
                  </div>
                  <div className="section-content expanded">
                    <div className="screening-grid">
                      {results.screening.map((item, i) => (
                        <div key={i} className={`screening-item ${item.status}`}>
                          <span className="screening-status">
                            {item.status === 'pass' ? '✓' : item.status === 'flag' ? '⚠' : '✕'}
                          </span>
                          <span>{item.criterion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Issues */}
                {results.issues.length > 0 && (
                  <div className="result-section">
                    <div className="section-header">
                      <h3>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Issues Found
                        <span className="issue-count">{results.issues.length}</span>
                      </h3>
                    </div>
                    <div className="section-content expanded">
                      <div style={{ padding: '1rem' }}>
                        {results.issues.map((issue, i) => (
                          <div key={i} className={`issue-card ${issue.severity}`}>
                            <h4>{issue.severity === 'red' ? '🔴' : '🟡'} {issue.title}</h4>
                            {issue.description && <p><strong>What:</strong> {issue.description}</p>}
                            {issue.risk && <p className="issue-risk"><strong>Risk:</strong> {issue.risk}</p>}
                            {issue.recommendation && <p><strong>Recommendation:</strong> {issue.recommendation}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div className="result-section">
                  <div className="section-header">
                    <h3>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      Recommendation
                    </h3>
                  </div>
                  <div className="section-content expanded">
                    <div style={{ padding: '1rem' }}>{results.recommendation}</div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="result-section">
                  <div className="section-header">
                    <h3>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                      </svg>
                      Next Steps
                    </h3>
                  </div>
                  <div className="section-content expanded">
                    <ul className="next-steps-list">
                      {results.nextSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p className="disclaimer">
            This tool assists with legal workflows but does not provide legal advice.
            All analysis should be reviewed by qualified legal professionals.
          </p>
        </div>
        <div className="footer-brand">© 2026 Consello</div>
      </footer>
    </>
  );
}

// Utility functions
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateReportHTML(results) {
  const colors = {
    green: { bg: '#E8F5E9', text: '#2E7D32' },
    yellow: { bg: '#FFF8E1', text: '#F9A825' },
    red: { bg: '#FFEBEE', text: '#C62828' }
  };
  const c = colors[results.classification] || colors.green;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Legal Analysis Report | Consello</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', Arial, sans-serif; color: #000; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 2rem; }
    .logo { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.05em; }
    .confidential { background: #000; color: #fff; padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 500; }
    h1 { font-size: 1.75rem; margin-bottom: 1rem; }
    .classification { display: inline-block; padding: 1rem 1.5rem; border-radius: 8px; font-weight: 700; font-size: 1.25rem; margin-bottom: 2rem; background: ${c.bg}; color: ${c.text}; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
    .info-item label { font-size: 0.75rem; color: #666; text-transform: uppercase; display: block; }
    .info-item span { font-weight: 500; }
    h2 { font-size: 1.25rem; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e0e0e0; }
    .screening-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    .screening-item { padding: 0.5rem 0.75rem; border-radius: 4px; font-size: 0.875rem; }
    .screening-item.pass { background: #E8F5E9; color: #2E7D32; }
    .screening-item.flag { background: #FFF8E1; color: #F9A825; }
    .screening-item.fail { background: #FFEBEE; color: #C62828; }
    .issue-card { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid; }
    .issue-card.yellow { background: #FFF8E1; border-color: #F9A825; }
    .issue-card.red { background: #FFEBEE; border-color: #C62828; }
    .issue-card h3 { font-size: 1rem; margin-bottom: 0.5rem; }
    .issue-card p { font-size: 0.875rem; margin-bottom: 0.25rem; }
    .recommendation { padding: 1rem; background: #f8f9fa; border-radius: 8px; }
    .next-steps { list-style: none; }
    .next-steps li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; }
    .next-steps li::before { content: "→"; position: absolute; left: 0; color: #A64A30; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e0e0e0; text-align: center; font-size: 0.75rem; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CONSELLO</div>
    <div><span class="confidential">CONFIDENTIAL</span></div>
  </div>
  <h1>Legal Analysis Report</h1>
  <p style="color: #666; margin-bottom: 1rem;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  <div class="classification">${results.level} — ${results.summary}</div>
  <div class="info-grid">
    <div class="info-item"><label>Document</label><span>${results.document}</span></div>
    <div class="info-item"><label>Parties</label><span>${results.parties}</span></div>
    <div class="info-item"><label>Type</label><span>${results.type}</span></div>
    <div class="info-item"><label>Term</label><span>${results.term}</span></div>
    <div class="info-item"><label>Governing Law</label><span>${results.governingLaw}</span></div>
  </div>
  <h2>Screening Results</h2>
  <div class="screening-grid">
    ${results.screening.map(item => `<div class="screening-item ${item.status}">${item.status === 'pass' ? '✓' : item.status === 'flag' ? '⚠' : '✕'} ${item.criterion}</div>`).join('')}
  </div>
  ${results.issues.length > 0 ? `
    <h2>Issues Found (${results.issues.length})</h2>
    ${results.issues.map(issue => `
      <div class="issue-card ${issue.severity}">
        <h3>${issue.severity === 'red' ? '🔴' : '🟡'} ${issue.title}</h3>
        ${issue.description ? `<p><strong>What:</strong> ${issue.description}</p>` : ''}
        ${issue.risk ? `<p><strong>Risk:</strong> ${issue.risk}</p>` : ''}
        ${issue.recommendation ? `<p><strong>Recommendation:</strong> ${issue.recommendation}</p>` : ''}
      </div>
    `).join('')}
  ` : ''}
  <h2>Recommendation</h2>
  <div class="recommendation">${results.recommendation}</div>
  <h2>Next Steps</h2>
  <ul class="next-steps">
    ${results.nextSteps.map(step => `<li>${step}</li>`).join('')}
  </ul>
  <div class="footer">
    <p>This analysis assists with legal workflows but does not constitute legal advice.</p>
    <p><strong>© ${new Date().getFullYear()} Consello</strong></p>
  </div>
</body>
</html>`;
}
