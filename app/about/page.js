'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-box"></div>
          <span className="logo-text">CONSELLO</span>
        </div>
        <nav className="nav">
          <Link href="/" className="nav-btn">Analyze</Link>
          <button className="nav-btn active">About</button>
        </nav>
        <div className="header-actions">
          <Link href="/" className="btn btn-ghost btn-sm">Back to App</Link>
        </div>
      </header>

      <main className="about-main">
        {/* Hero Section */}
        <section className="about-hero">
          <h1>AI-Powered Legal Analysis</h1>
          <p className="about-subtitle">
            Streamline contract review and NDA triage with intelligent automation
            built on Anthropic's Claude.
          </p>
        </section>

        {/* Current Features */}
        <section className="features-section">
          <div className="section-label">What's Available Now</div>
          <h2>Core Capabilities</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon green">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <h3>NDA Triage</h3>
              <p>
                Instant classification of incoming NDAs against your organizational playbook.
                Get GREEN, YELLOW, or RED ratings with specific issue identification and
                recommended actions.
              </p>
              <ul className="feature-list">
                <li>Automated screening against 12+ criteria</li>
                <li>Identifies prohibited provisions (non-competes, IP assignment)</li>
                <li>Checks for required carveouts</li>
                <li>Clear routing recommendations</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3>Contract Review</h3>
              <p>
                Deep clause-by-clause analysis of any commercial agreement against your
                negotiation playbook. Get specific redline suggestions for deviations.
              </p>
              <ul className="feature-list">
                <li>Liability, indemnification, IP analysis</li>
                <li>Data protection and confidentiality review</li>
                <li>Term and termination assessment</li>
                <li>Governing law evaluation</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon dark">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3>Consistent Standards</h3>
              <p>
                Every analysis applies the same playbook criteria, ensuring consistent
                evaluation regardless of who reviews the document or when.
              </p>
              <ul className="feature-list">
                <li>Configurable playbook positions</li>
                <li>Acceptable ranges and escalation triggers</li>
                <li>Organizational risk framework</li>
                <li>Audit-ready documentation</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon terracotta">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <h3>Branded Reports</h3>
              <p>
                Export professional, Consello-branded HTML reports suitable for
                sharing with stakeholders or archiving in your contract management system.
              </p>
              <ul className="feature-list">
                <li>Executive-ready formatting</li>
                <li>Classification badges</li>
                <li>Issue summaries with recommendations</li>
                <li>Clear next steps</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works-section">
          <div className="section-label">Process</div>
          <h2>How It Works</h2>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Upload Document</h3>
              <p>Drop your NDA or contract into the analyzer. Supports TXT files with PDF support coming soon.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Claude reviews every clause against your playbook standards and risk thresholds.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get Results</h3>
              <p>Receive instant classification, issue identification, and actionable recommendations.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Take Action</h3>
              <p>Route for approval, negotiate specific terms, or escalate to senior counsel.</p>
            </div>
          </div>
        </section>

        {/* Classification System */}
        <section className="classification-section">
          <div className="section-label">Risk Framework</div>
          <h2>Classification System</h2>

          <div className="classification-grid">
            <div className="classification-card green">
              <div className="classification-header">
                <span className="classification-icon">✓</span>
                <h3>GREEN</h3>
              </div>
              <p className="classification-title">Standard Approval</p>
              <p>All playbook standards met. Approve via delegation of authority. Same-day turnaround.</p>
            </div>

            <div className="classification-card yellow">
              <div className="classification-header">
                <span className="classification-icon">⚠</span>
                <h3>YELLOW</h3>
              </div>
              <p className="classification-title">Counsel Review</p>
              <p>Minor deviations within acceptable ranges. Route to designated reviewer. 1-2 business days.</p>
            </div>

            <div className="classification-card red">
              <div className="classification-header">
                <span className="classification-icon">✕</span>
                <h3>RED</h3>
              </div>
              <p className="classification-title">Escalation Required</p>
              <p>Outside acceptable ranges or escalation triggers present. Senior counsel review. 3-5 business days.</p>
            </div>
          </div>
        </section>

        {/* Future Capabilities */}
        <section className="roadmap-section">
          <div className="section-label">Coming Soon</div>
          <h2>Future Capabilities</h2>
          <p className="roadmap-intro">
            The legal AI platform is designed to expand with additional capabilities
            and integrations. Here's what's on the roadmap.
          </p>

          <div className="roadmap-grid">
            <div className="roadmap-card">
              <div className="roadmap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3>Templated Responses</h3>
              <p>
                Generate pre-approved responses for common legal inquiries: data subject
                access requests, NDA requests, vendor security questionnaires, litigation
                holds, and contract amendments.
              </p>
              <span className="roadmap-tag">Ready to Build</span>
            </div>

            <div className="roadmap-card">
              <div className="roadmap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>Daily Legal Brief</h3>
              <p>
                Morning briefings summarizing overnight requests, upcoming deadlines,
                contract expirations, and items requiring attention—pulled from your
                Microsoft 365 calendar and email.
              </p>
              <span className="roadmap-tag">Requires M365 Integration</span>
            </div>

            <div className="roadmap-card">
              <div className="roadmap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <h3>Vendor Check</h3>
              <p>
                Instantly look up existing agreements with any vendor—NDAs, MSAs, DPAs,
                expiration dates, and key terms—from your SharePoint contract repository.
              </p>
              <span className="roadmap-tag">Requires SharePoint Integration</span>
            </div>

            <div className="roadmap-card">
              <div className="roadmap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <h3>Teams Integration</h3>
              <p>
                Receive NDA triage requests directly in Microsoft Teams. Legal team
                members can submit documents and get classifications without leaving
                their workflow.
              </p>
              <span className="roadmap-tag">Requires Teams Integration</span>
            </div>

            <div className="roadmap-card">
              <div className="roadmap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h3>PDF Processing</h3>
              <p>
                Direct analysis of PDF documents with automatic text extraction,
                eliminating the need to convert files before upload.
              </p>
              <span className="roadmap-tag">Ready to Build</span>
            </div>

            <div className="roadmap-card">
              <div className="roadmap-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Compliance Module</h3>
              <p>
                Specialized review for privacy regulations (GDPR, CCPA), DPA
                requirements, and data subject request handling with jurisdiction-specific
                guidance.
              </p>
              <span className="roadmap-tag">Ready to Build</span>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="tech-section">
          <div className="section-label">Technology</div>
          <h2>Built on Claude</h2>
          <p className="tech-intro">
            Powered by Anthropic's Claude Opus 4, the most capable AI model for complex
            reasoning and nuanced analysis. Claude excels at understanding legal language,
            identifying subtle issues, and providing actionable recommendations.
          </p>
          <div className="tech-badges">
            <span className="tech-badge">Claude Opus 4</span>
            <span className="tech-badge">Anthropic API</span>
            <span className="tech-badge">Next.js</span>
            <span className="tech-badge">Vercel</span>
          </div>
        </section>
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
