'use client';

import { useState, useEffect } from 'react';

// Step configuration with playful substep messages
const STEPS = [
  {
    label: "Parsing document",
    substeps: [
      "Extracting text layers...",
      "Mapping document structure...",
      "Identifying clause boundaries...",
    ],
    duration: 3000,
  },
  {
    label: "Analyzing with Claude",
    substeps: [
      "Warming up the neurons...",
      "Pondering legalese...",
      "Cross-referencing your playbook...",
      "Scrutinizing the fine print...",
      "Raising an eyebrow at Section 4...",
      "Double-checking definitions...",
    ],
    duration: 8000,
  },
  {
    label: "Identifying issues",
    substeps: [
      "Hunting for red flags...",
      "Comparing against market standards...",
      "Flagging unusual terms...",
      "Assessing risk levels...",
    ],
    duration: 5000,
  },
  {
    label: "Generating recommendations",
    substeps: [
      "Drafting suggested edits...",
      "Polishing the analysis...",
      "Almost there...",
    ],
    duration: 4000,
  },
];

// Icon components
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill="#A64A30" />
    <path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ animation: "spin 1s linear infinite" }}>
    <circle cx="9" cy="9" r="7.5" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
    <path d="M9 1.5a7.5 7.5 0 0 1 7.5 7.5" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PendingDot = () => (
  <div style={{
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: "1.5px solid rgba(0,0,0,0.1)",
    background: "rgba(0,0,0,0.02)",
  }} />
);

/**
 * AnalysisProgressModal - Animated analysis progress with playful substep messages
 */
export default function AnalysisProgressModal({
  isOpen,
  currentPhase,
  documentInfo,
  onCancel,
  onComplete,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentSubstep, setCurrentSubstep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCurrentSubstep(0);
      setCompletedSteps(new Set());
      setProgress(0);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Progress bar calculation
  useEffect(() => {
    if (!isOpen) return;
    const totalDuration = STEPS.reduce((sum, s) => sum + s.duration, 0);
    const elapsed = STEPS.slice(0, currentStep).reduce((sum, s) => sum + s.duration, 0);
    const stepProgress = STEPS[currentStep]
      ? (currentSubstep / STEPS[currentStep].substeps.length) * STEPS[currentStep].duration
      : 0;
    setProgress(Math.min(((elapsed + stepProgress) / totalDuration) * 100, 98));
  }, [currentStep, currentSubstep, isOpen]);

  // Step progression — cycles through substeps, then advances to next step
  useEffect(() => {
    if (!isOpen) return;
    if (currentStep >= STEPS.length) {
      setProgress(100);
      setTimeout(() => onComplete?.(), 800);
      return;
    }
    const step = STEPS[currentStep];
    const substepInterval = step.duration / step.substeps.length;
    const timer = setInterval(() => {
      setCurrentSubstep((prev) => {
        if (prev >= step.substeps.length - 1) {
          clearInterval(timer);
          setCompletedSteps((s) => new Set([...s, currentStep]));
          setTimeout(() => {
            setCurrentStep((cs) => cs + 1);
            setCurrentSubstep(0);
          }, 400);
          return prev;
        }
        return prev + 1;
      });
    }, substepInterval);
    return () => clearInterval(timer);
  }, [currentStep, isOpen, onComplete]);

  if (!isOpen) return null;

  const isComplete = currentStep >= STEPS.length;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', Arial, sans-serif",
    }}>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          animation: "overlayIn 0.3s ease forwards",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "460px",
        margin: "0 20px",
        background: "#fff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)",
        animation: visible ? "modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none",
        opacity: visible ? 1 : 0,
      }}>
        {/* Shimmer progress bar at top */}
        <div style={{ height: "3px", background: "rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: isComplete ? "#A64A30" : "linear-gradient(90deg, #000 0%, #333 50%, #000 100%)",
            backgroundSize: isComplete ? "100%" : "200% 100%",
            animation: isComplete ? "none" : "shimmer 2s linear infinite",
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            borderRadius: "0 2px 2px 0",
          }} />
        </div>

        <div style={{ padding: "32px 32px 28px" }}>
          {/* Header — pulsing dot while active, checkmark when done */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
            {!isComplete && (
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#A64A30",
                animation: "progressPulse 2s ease-in-out infinite",
                flexShrink: 0,
              }} />
            )}
            {isComplete && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" fill="#A64A30" />
                <path d="M6 10.5L8.5 13L14 7.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <h2 style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.3px", margin: 0 }}>
              {isComplete ? "Analysis Complete" : "Analyzing Document"}
            </h2>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {STEPS.map((step, i) => {
              const isDone = completedSteps.has(i);
              const isActive = currentStep === i;
              const isPending = !isDone && !isActive;

              return (
                <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", position: "relative" }}>
                  {/* Vertical connector line between steps */}
                  {i < STEPS.length - 1 && (
                    <div style={{
                      position: "absolute",
                      left: "8.5px",
                      top: "24px",
                      width: "1.5px",
                      height: "calc(100% - 6px)",
                      background: isDone ? "#A64A30" : "rgba(0,0,0,0.08)",
                      transition: "background 0.4s ease",
                    }} />
                  )}

                  {/* Step icon — switches between CheckIcon, SpinnerIcon, PendingDot */}
                  <div style={{ flexShrink: 0, paddingTop: "2px" }}>
                    {isDone ? <CheckIcon /> : isActive ? <SpinnerIcon /> : <PendingDot />}
                  </div>

                  {/* Step label + animated substep text */}
                  <div style={{ paddingBottom: i < STEPS.length - 1 ? "24px" : "0", minHeight: isActive ? "56px" : "auto" }}>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : isDone ? 500 : 400,
                      color: isPending ? "rgba(0,0,0,0.3)" : "#000",
                      transition: "all 0.3s ease",
                      display: "block",
                      lineHeight: "20px",
                    }}>
                      {step.label}
                    </span>
                    {/* Substep text animates in with fadeInUp, key change triggers re-animation */}
                    {isActive && (
                      <span
                        key={`${i}-${currentSubstep}`}
                        style={{
                          fontSize: "13px",
                          color: "#999",
                          display: "block",
                          marginTop: "4px",
                          animation: "fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                          lineHeight: "18px",
                        }}
                      >
                        {step.substeps[currentSubstep]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 32px 24px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#999",
              background: "none",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "9999px",
              padding: "8px 20px",
              cursor: "pointer",
              fontFamily: "'DM Sans', Arial, sans-serif",
              transition: "all 0.2s",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
