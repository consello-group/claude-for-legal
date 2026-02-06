'use client';

/**
 * AnalysisProgressModal - Shows analysis progress with phased steps
 */
export default function AnalysisProgressModal({
  isOpen,
  currentPhase,
  documentInfo,
  onCancel,
}) {
  if (!isOpen) return null;

  const phases = [
    {
      id: 'parse',
      label: 'Document parsed',
      detail: documentInfo ? `${documentInfo.blockCount} blocks, ${documentInfo.wordCount} words` : null,
    },
    {
      id: 'analyze',
      label: 'Analyzing with Claude',
      detail: 'Screening against playbook...',
    },
    {
      id: 'identify',
      label: 'Identifying issues',
      detail: null,
    },
    {
      id: 'recommend',
      label: 'Generating recommendations',
      detail: null,
    },
  ];

  const getPhaseIndex = (phaseId) => phases.findIndex(p => p.id === phaseId);
  const currentIndex = getPhaseIndex(currentPhase);

  return (
    <div className="modal-overlay">
      <div className="analysis-modal">
        <div className="analysis-modal-header">
          <h2>Analyzing Document</h2>
          {documentInfo?.filename && (
            <span className="analysis-filename">{documentInfo.filename}</span>
          )}
        </div>

        <div className="analysis-phases">
          {phases.map((phase, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div
                key={phase.id}
                className={`analysis-phase ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="phase-indicator">
                  {isComplete ? (
                    <span className="phase-check">✓</span>
                  ) : isCurrent ? (
                    <span className="phase-spinner"></span>
                  ) : (
                    <span className="phase-dot"></span>
                  )}
                </div>
                <div className="phase-content">
                  <span className="phase-label">{phase.label}</span>
                  {phase.detail && (isComplete || isCurrent) && (
                    <span className="phase-detail">{phase.detail}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="analysis-modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
