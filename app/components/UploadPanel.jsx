'use client';

import { useRef } from 'react';
import { formatFileSize } from '../lib/utils';

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

const SAMPLES = [
  { id: "standard", name: "Standard NDA", desc: "Clean mutual NDA with typical terms" },
  { id: "problematic", name: "Problematic NDA", desc: "Contains several red-flag clauses" },
];

export default function UploadPanel({
  selectedFile,
  selectedSample,
  isDragging,
  isParsing,
  isAnalyzing,
  mounted,
  error,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onSampleSelect,
  onClear,
  onAnalyze,
  onDemo,
}) {
  const fileInputRef = useRef(null);
  const hasSelection = selectedFile || selectedSample;

  return (
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
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
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
            onChange={onFileSelect}
            style={{ display: "none" }}
          />
          {selectedFile ? (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px", background: "#000",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 3a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V3z" fill="#fff" fillOpacity="0.9" />
                </svg>
              </div>
              <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "14px", fontWeight: 600,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{selectedFile.name}</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                  {formatFileSize(selectedFile.size)}
                  {isParsing && " · Parsing..."}
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onClear(); }} style={{
                width: "28px", height: "28px", borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.08)", background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "16px", color: "#999", flexShrink: 0,
              }}>×</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <p style={{ fontSize: "14px", color: "#333", fontWeight: 500, margin: 0 }}>
                Drag & drop your file here
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                <span style={{ fontSize: "13px", color: "#999" }}>or</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  fontSize: "13px", color: "#A64A30", fontWeight: 500,
                  padding: "5px 14px", borderRadius: "9999px",
                  border: "1px solid rgba(166, 74, 48, 0.25)", background: "rgba(166, 74, 48, 0.04)",
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
            {SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSampleSelect(sample.id)}
                style={{
                  flex: 1, padding: "14px 16px", borderRadius: "10px",
                  border: selectedSample === sample.id ? "1.5px solid #000" : "1.5px solid rgba(0,0,0,0.08)",
                  background: selectedSample === sample.id ? "rgba(0,0,0,0.02)" : "#fff",
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s",
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
          onClick={onAnalyze}
          disabled={!hasSelection || isAnalyzing || isParsing}
          style={{
            width: "100%", padding: "16px", borderRadius: "9999px",
            border: "none",
            background: hasSelection && !isParsing ? "#000" : "rgba(0,0,0,0.08)",
            color: hasSelection && !isParsing ? "#fff" : "rgba(0,0,0,0.3)",
            fontSize: "15px", fontWeight: 600,
            cursor: hasSelection && !isParsing ? "pointer" : "not-allowed",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            fontFamily: "'DM Sans', Arial, sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
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
            textAlign: "center", fontSize: "12px", color: "#A64A30",
            marginTop: "10px", fontWeight: 500, animation: "fadeIn 0.3s ease",
          }}>
            Powered by Claude
          </p>
        )}
        {error && (
          <p style={{
            textAlign: "center", fontSize: "13px", color: "#C62828",
            marginTop: "12px", fontWeight: 500,
          }}>
            {error}
          </p>
        )}
      </div>

      {/* Value Props */}
      <div className={mounted ? "fade-up delay-3" : ""} style={{
        display: "flex", flexDirection: "column", gap: "10px",
        marginTop: "36px", padding: "0 4px",
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

      {/* Demo Mode */}
      {onDemo && (
        <div className={mounted ? "fade-up delay-4" : ""} style={{
          marginTop: "28px", padding: "0 4px",
        }}>
          <p style={{ fontSize: "12px", color: "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
            Instant demos
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { type: "green", label: "GREEN", desc: "Standard Approval", color: "#2E7D32", bg: "#E8F5E9" },
              { type: "yellow", label: "YELLOW", desc: "Counsel Review", color: "#92400E", bg: "#FFF8E1" },
              { type: "red", label: "RED", desc: "Escalation Required", color: "#C62828", bg: "#FFEBEE" },
            ].map((demo) => (
              <button
                key={demo.type}
                onClick={() => onDemo(demo.type)}
                style={{
                  flex: 1, padding: "12px 10px", borderRadius: "10px",
                  border: `1.5px solid ${demo.color}20`,
                  background: demo.bg,
                  cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                  fontFamily: "'DM Sans', Arial, sans-serif",
                }}
              >
                <div style={{ fontSize: "12px", fontWeight: 700, color: demo.color, letterSpacing: "0.3px" }}>{demo.label}</div>
                <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{demo.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trust/Security Footer */}
      <div className={mounted ? "fade-up delay-4" : ""} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        marginTop: "32px", padding: "16px", borderRadius: "10px",
        background: "rgba(166, 74, 48, 0.03)", border: "1px solid rgba(166, 74, 48, 0.08)",
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
  );
}
