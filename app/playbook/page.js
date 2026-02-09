'use client';

import { useState } from 'react';
import ThresholdBar from '../components/ThresholdBar';
import NavBar from '../components/NavBar';
import {
  PLAYBOOK_CLAUSES,
  NDA_SCREENING,
  CLASSIFICATION_LEVELS,
} from '../lib/playbook';

// Badge color map
const BADGE_COLORS = {
  nda: { bg: '#E8F5E9', text: '#2E7D32', label: 'NDA' },
  service: { bg: '#E3F2FD', text: '#1565C0', label: 'MSA' },
  license: { bg: '#FFF3E0', text: '#E65100', label: 'License' },
};

// Chevron icon
function ChevronIcon({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.25s ease',
      }}
    >
      <path
        d="M5 7l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Classification level color config
const LEVEL_COLORS = {
  GREEN: { bg: '#E8F5E9', border: '#2E7D32', text: '#2E7D32', icon: '✓' },
  YELLOW: { bg: '#FFF8E1', border: '#F9A825', text: '#F57F17', icon: '⚠' },
  RED: { bg: '#FFEBEE', border: '#C62828', text: '#C62828', icon: '✕' },
};

export default function PlaybookPage() {
  const [openClauses, setOpenClauses] = useState({});

  const toggleClause = (id) => {
    setOpenClauses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <NavBar activePage="playbook" />

      {/* Hero */}
      <section className="playbook-hero">
        <div className="playbook-hero-content">
          <div className="section-label">Configuration</div>
          <h1>Your Legal Playbook</h1>
          <p className="playbook-hero-subtitle">
            Every contract is analyzed against these standard positions, acceptable ranges,
            and escalation triggers. Configure per organization to match your risk tolerance
            and negotiation strategy.
          </p>
        </div>
      </section>

      <main className="playbook-main">

        {/* Clause Positions */}
        <section className="playbook-section">
          <div className="section-label">Standards</div>
          <h2>Clause Positions</h2>
          <p className="playbook-section-intro">
            Each clause is evaluated against three tiers: the standard position you want,
            the range you'll accept, and the trigger that escalates to senior counsel.
          </p>

          <div className="playbook-clause-grid">
            {PLAYBOOK_CLAUSES.map((clause) => {
              const isOpen = !!openClauses[clause.id];
              return (
                <div
                  key={clause.id}
                  className={`playbook-clause-card ${isOpen ? 'open' : ''}`}
                >
                  <button
                    className="playbook-clause-header"
                    onClick={() => toggleClause(clause.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="playbook-clause-title-row">
                      <h3>{clause.category}</h3>
                      <div className="playbook-badges">
                        {clause.appliesTo.map((type) => {
                          const badge = BADGE_COLORS[type];
                          return (
                            <span
                              key={type}
                              className="playbook-badge"
                              style={{ background: badge.bg, color: badge.text }}
                            >
                              {badge.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <ChevronIcon open={isOpen} />
                  </button>

                  {isOpen && (
                    <div className="playbook-clause-body">
                      <div className="playbook-tier playbook-tier-green">
                        <span className="playbook-tier-label">Standard Position</span>
                        <p>{clause.standardPosition}</p>
                      </div>

                      {clause.acceptableRange && (
                        <div className="playbook-tier playbook-tier-yellow">
                          <span className="playbook-tier-label">Acceptable Range</span>
                          <p>{clause.acceptableRange}</p>
                        </div>
                      )}

                      <div className="playbook-tier playbook-tier-red">
                        <span className="playbook-tier-label">Escalation Trigger</span>
                        <p>{clause.escalationTrigger}</p>
                      </div>

                      {clause.threshold && (
                        <ThresholdBar threshold={clause.threshold} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* NDA Screening */}
        <section className="playbook-section">
          <div className="section-label">Screening</div>
          <h2>NDA Screening Criteria</h2>
          <p className="playbook-section-intro">
            Every incoming NDA is screened against these criteria before classification.
            All required carveouts must be present; any prohibited provision triggers RED.
          </p>

          <div className="playbook-screening-grid">
            {NDA_SCREENING.map((section) => (
              <div key={section.category} className="playbook-screening-card">
                <h3>{section.category}</h3>
                <ul>
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Classification Framework */}
        <section className="playbook-section">
          <div className="section-label">Framework</div>
          <h2>Classification & Routing</h2>
          <p className="playbook-section-intro">
            After analysis, every document receives a classification that determines
            its routing, timeline, and responsible party.
          </p>

          <div className="playbook-classification-grid">
            {CLASSIFICATION_LEVELS.map((level) => {
              const colors = LEVEL_COLORS[level.level];
              return (
                <div
                  key={level.level}
                  className="playbook-classification-card"
                  style={{
                    background: colors.bg,
                    borderColor: colors.border,
                  }}
                >
                  <div className="playbook-classification-header">
                    <span
                      className="playbook-classification-icon"
                      style={{ color: colors.text }}
                    >
                      {colors.icon}
                    </span>
                    <h3 style={{ color: colors.text }}>{level.level}</h3>
                  </div>
                  <p className="playbook-classification-label">{level.label}</p>
                  <p className="playbook-classification-desc">{level.description}</p>
                  <div className="playbook-classification-meta">
                    <div>
                      <span className="meta-label">Action</span>
                      <span className="meta-value">{level.action}</span>
                    </div>
                    <div>
                      <span className="meta-label">Timeline</span>
                      <span className="meta-value">{level.timeline}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Routing Table */}
        <section className="playbook-section">
          <div className="section-label">Routing</div>
          <h2>Decision Matrix</h2>

          <div className="playbook-routing-table-wrap">
            <table className="playbook-routing-table">
              <thead>
                <tr>
                  <th>Classification</th>
                  <th>Action</th>
                  <th>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {CLASSIFICATION_LEVELS.map((level) => {
                  const colors = LEVEL_COLORS[level.level];
                  return (
                    <tr key={level.level}>
                      <td>
                        <span
                          className="playbook-routing-badge"
                          style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
                        >
                          {colors.icon} {level.level}
                        </span>
                      </td>
                      <td>{level.action}</td>
                      <td>{level.timeline}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* How It's Customized */}
        <section className="playbook-section">
          <div className="playbook-customization-callout">
            <h3>How It's Customized</h3>
            <p>
              The playbook is defined as structured data — each standard position,
              acceptable range, and escalation trigger can be configured per organization.
              Update a single module to change every analysis going forward.
            </p>
            <p className="playbook-callout-detail">
              Built on Anthropic's{' '}
              <a
                href="https://github.com/anthropics/knowledge-work-plugins/tree/main/legal"
                target="_blank"
                rel="noopener noreferrer"
              >
                Legal Plugin architecture
              </a>
              {' '}— designed for in-house legal teams who need consistent, auditable
              contract review at scale.
            </p>
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
