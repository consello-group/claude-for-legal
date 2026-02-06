'use client';

/**
 * NotAContractPage - Fun error page when document isn't a legal contract
 * Inspired by creative 404 pages
 */
export default function NotAContractPage({
  documentType,
  reason,
  filename,
  onTryAgain,
}) {
  // Fun messages based on document type
  const getFunMessage = () => {
    const type = documentType?.toLowerCase() || '';

    if (type.includes('resume') || type.includes('cv')) {
      return {
        emoji: '👔',
        headline: "Nice resume, but we're not hiring!",
        subtext: "We analyze contracts, not career highlights. Though your experience does look impressive.",
      };
    }

    if (type.includes('article') || type.includes('blog') || type.includes('news')) {
      return {
        emoji: '📰',
        headline: "Interesting read, wrong app!",
        subtext: "We're contract analysts, not book critics. Save this one for your reading list.",
      };
    }

    if (type.includes('memo') || type.includes('note') || type.includes('meeting')) {
      return {
        emoji: '📝',
        headline: "Meetings aren't legally binding... usually.",
        subtext: "This looks like internal notes. We need actual contracts with parties and obligations.",
      };
    }

    if (type.includes('marketing') || type.includes('brochure') || type.includes('pitch')) {
      return {
        emoji: '📊',
        headline: "Great pitch! Wrong audience.",
        subtext: "We review legal agreements, not sales decks. Though your graphics are lovely.",
      };
    }

    if (type.includes('financial') || type.includes('report') || type.includes('statement')) {
      return {
        emoji: '📈',
        headline: "Numbers don't need lawyers... yet.",
        subtext: "This is financial data, not a legal contract. Try your accounting software.",
      };
    }

    if (type.includes('manual') || type.includes('documentation') || type.includes('technical')) {
      return {
        emoji: '📚',
        headline: "RTFM, but not here!",
        subtext: "Technical docs are great, but we specialize in legal documents.",
      };
    }

    if (type.includes('email') || type.includes('correspondence') || type.includes('letter')) {
      return {
        emoji: '✉️',
        headline: "Dear Reader, this isn't a contract.",
        subtext: "We need formal agreements with legal obligations, not correspondence.",
      };
    }

    // Default fallback
    return {
      emoji: '🤔',
      headline: "Hmm, this doesn't look like a contract.",
      subtext: "We were expecting NDAs, service agreements, or other legal documents.",
    };
  };

  const funMessage = getFunMessage();

  return (
    <div className="not-contract-page">
      <div className="not-contract-content">
        <div className="not-contract-emoji">{funMessage.emoji}</div>

        <h1 className="not-contract-headline">{funMessage.headline}</h1>

        <p className="not-contract-subtext">{funMessage.subtext}</p>

        {filename && (
          <div className="not-contract-file">
            <span className="file-icon">📄</span>
            <span className="file-name">{filename}</span>
          </div>
        )}

        {reason && (
          <div className="not-contract-reason">
            <strong>What we found:</strong> {reason}
          </div>
        )}

        <div className="not-contract-help">
          <h3>We can analyze:</h3>
          <ul>
            <li>Non-Disclosure Agreements (NDAs)</li>
            <li>Service Agreements & MSAs</li>
            <li>Software License Agreements</li>
            <li>Employment & Consulting Agreements</li>
            <li>Vendor & Purchase Agreements</li>
          </ul>
        </div>

        <button className="btn btn-primary btn-large" onClick={onTryAgain}>
          Try Another Document
        </button>
      </div>

      <div className="not-contract-decoration">
        <div className="floating-doc doc-1">📄</div>
        <div className="floating-doc doc-2">📋</div>
        <div className="floating-doc doc-3">📑</div>
      </div>
    </div>
  );
}
