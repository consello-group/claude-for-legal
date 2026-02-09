'use client';

import { useState, useRef, useEffect } from 'react';
import { formatFileSize } from '../lib/utils';

export default function UploadPanel({
  selectedFile,
  isDragging,
  isParsing,
  isAnalyzing,
  mounted,
  error,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onClear,
  onAnalyze,
  onDemo,
  onLogout,
}) {
  const fileInputRef = useRef(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAFAFA",
      fontFamily: "'DM Sans', Arial, sans-serif",
      color: "#000",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .d1 { animation-delay: 0.06s; }
        .d2 { animation-delay: 0.12s; }
        .d3 { animation-delay: 0.18s; }
        .d4 { animation-delay: 0.24s; }
        .demo-btn-v2 { transition: all 0.15s ease; }
        .demo-btn-v2:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
      `}</style>

      {/* Nav */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        height: "56px",
        background: "#fff",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div style={{
            width: "32px", height: "32px", background: "#000",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontSize: "7px", fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
              Consello
            </span>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            {[
              { label: "Analyze", href: "/", active: true },
              { label: "Playbook", href: "/playbook", active: false },
              { label: "About", href: "/about", active: false },
            ].map((item) => (
              <a key={item.label} href={item.href} style={{
                fontSize: "13px",
                fontWeight: 500,
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "9999px",
                background: item.active ? "#000" : "transparent",
                color: item.active ? "#fff" : "#666",
                transition: "all 0.15s ease",
              }}>{item.label}</a>
            ))}
          </div>
        </div>
        <div
          onClick={onLogout}
          title="Logout"
          style={{
            width: "30px", height: "30px", borderRadius: "50%", background: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 600, color: "#fff", cursor: "pointer",
          }}
        >DM</div>
      </nav>

      {/* Main */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px 40px",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}>
        {/* Header */}
        <div className={mounted ? "fade-up" : ""} style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
            marginBottom: "8px",
          }}>Contract Analysis</h1>
          <p style={{ fontSize: "14px", color: "#888", lineHeight: 1.5 }}>
            Upload a contract to review against your legal playbook.
          </p>
        </div>

        {/* Upload Card */}
        <div className={mounted ? "fade-up d1" : ""} style={{
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid rgba(0,0,0,0.06)",
          padding: "22px 24px",
          width: "100%",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            style={{
              border: `1.5px dashed ${isDragging ? "#A64A30" : selectedFile ? "#000" : "rgba(0,0,0,0.12)"}`,
              borderRadius: "10px",
              padding: selectedFile ? "16px" : "28px 20px",
              textAlign: "center",
              cursor: selectedFile ? "default" : "pointer",
              transition: "all 0.2s ease",
              background: isDragging ? "rgba(166,74,48,0.02)" : selectedFile ? "rgba(0,0,0,0.015)" : "transparent",
            }}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" onChange={onFileSelect} style={{ display: "none" }} />
            {selectedFile ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "8px", background: "#000",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M4 3a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V3z" fill="#fff" fillOpacity="0.9" />
                  </svg>
                </div>
                <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedFile.name}</div>
                  <div style={{ fontSize: "11px", color: "#999", marginTop: "1px" }}>
                    {formatFileSize(selectedFile.size)}
                    {isParsing && " · Parsing..."}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onClear(); }} style={{
                  width: "26px", height: "26px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", color: "#999", flexShrink: 0, fontFamily: "inherit",
                }}>×</button>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "13px", color: "#333", fontWeight: 500, margin: 0 }}>Drag & drop your file here</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "6px" }}>
                  <span style={{ fontSize: "12px", color: "#bbb" }}>or</span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "4px",
                    fontSize: "12px", color: "#A64A30", fontWeight: 500,
                    padding: "4px 12px", borderRadius: "9999px",
                    border: "1px solid rgba(166,74,48,0.2)", background: "rgba(166,74,48,0.03)",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M4 6l4-4 4 4" stroke="#A64A30" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Browse files
                  </span>
                </div>
                <p style={{ fontSize: "11px", color: "#ccc", marginTop: "8px", margin: "8px 0 0 0" }}>PDF, DOCX, or TXT — up to 25MB</p>
              </>
            )}
          </div>

          {/* Analyze Button — inside card */}
          <button
            onClick={onAnalyze}
            disabled={!selectedFile || isAnalyzing || isParsing}
            style={{
              width: "100%", marginTop: "14px", padding: "13px", borderRadius: "9999px", border: "none",
              background: selectedFile && !isParsing ? "#000" : "rgba(0,0,0,0.06)",
              color: selectedFile && !isParsing ? "#fff" : "rgba(0,0,0,0.25)",
              fontSize: "14px", fontWeight: 600,
              cursor: selectedFile && !isParsing ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
              fontFamily: "'DM Sans', Arial, sans-serif",
              boxShadow: selectedFile && !isParsing ? "0 2px 10px rgba(0,0,0,0.12)" : "none",
            }}
          >
            {isAnalyzing ? "Analyzing..." : isParsing ? "Parsing..." : "Start Analysis"}
          </button>
          {error && (
            <p style={{
              textAlign: "center", fontSize: "12px", color: "#C62828",
              marginTop: "10px", fontWeight: 500,
            }}>{error}</p>
          )}
        </div>

        {/* Divider */}
        <div className={mounted ? "fade-up d2" : ""} style={{
          display: "flex", alignItems: "center", gap: "12px", width: "100%", margin: "22px 0",
        }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.06)" }} />
          <span style={{ fontSize: "11px", fontWeight: 500, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px" }}>or try a demo</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(0,0,0,0.06)" }} />
        </div>

        {/* Instant Demos */}
        {onDemo && (
          <div className={mounted ? "fade-up d3" : ""} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", width: "100%",
          }}>
            {[
              { type: "green", label: "Green", sublabel: "Standard Approval", bg: "rgba(22,163,74,0.06)", border: "rgba(22,163,74,0.15)", color: "#16A34A", dotColor: "#16A34A" },
              { type: "yellow", label: "Yellow", sublabel: "Counsel Review", bg: "rgba(234,179,8,0.06)", border: "rgba(234,179,8,0.2)", color: "#A16207", dotColor: "#EAB308" },
              { type: "red", label: "Red", sublabel: "Escalation Required", bg: "rgba(220,38,38,0.05)", border: "rgba(220,38,38,0.12)", color: "#DC2626", dotColor: "#DC2626" },
            ].map((demo) => (
              <button key={demo.type} className="demo-btn-v2" onClick={() => onDemo(demo.type)} style={{
                padding: "14px 12px", borderRadius: "10px",
                border: `1px solid ${demo.border}`, background: demo.bg,
                cursor: "pointer", textAlign: "center", fontFamily: "'DM Sans', Arial, sans-serif",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "3px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: demo.dotColor }} />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: demo.color, textTransform: "uppercase", letterSpacing: "0.3px" }}>{demo.label}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#999", fontWeight: 400 }}>{demo.sublabel}</div>
              </button>
            ))}
          </div>
        )}

        {/* Value Props */}
        <div className={mounted ? "fade-up d4" : ""} style={{
          width: "100%", marginTop: "28px", display: "flex", flexDirection: "column", gap: "6px",
        }}>
          {[
            "Identifies risk clauses and unusual terms",
            "Checks against your standard legal playbook",
            "Flags missing protections and suggested edits",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#A64A30" fillOpacity="0.08" />
                <path d="M5 8.5L7 10L11 6" stroke="#A64A30" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "12px", color: "#888" }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Security */}
        <div className={mounted ? "fade-up d4" : ""} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "20px",
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L2.5 4v4c0 3.5 2.3 5.5 5.5 6.5 3.2-1 5.5-3 5.5-6.5V4L8 1.5z" stroke="#bbb" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M5.5 8.5L7 10l3.5-3.5" stroke="#bbb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: "11px", color: "#bbb" }}>Documents are processed securely and not stored after analysis</span>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: "16px 28px", borderTop: "1px solid rgba(0,0,0,0.04)", flexShrink: 0 }}>
        <p style={{ fontSize: "11px", color: "#ccc", margin: 0 }}>© {new Date().getFullYear()} Consello. This tool assists with legal workflows but does not constitute legal advice.</p>
      </footer>
    </div>
  );
}
