'use client';

/**
 * NotAContractPage - Fun error page when document isn't a legal contract
 * Inspired by creative 404 pages — v2 inline-styled
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFAFA',
      padding: '48px 20px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'DM Sans', Arial, sans-serif",
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '520px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '24px' }}>
          {funMessage.emoji}
        </div>

        <h1 style={{
          fontSize: '28px', fontWeight: 700, letterSpacing: '-0.3px',
          color: '#000', marginBottom: '12px', lineHeight: 1.2,
        }}>
          {funMessage.headline}
        </h1>

        <p style={{
          fontSize: '15px', color: '#666', lineHeight: 1.6,
          marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px',
        }}>
          {funMessage.subtext}
        </p>

        {filename && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px', background: '#fff', borderRadius: '10px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            marginBottom: '24px',
          }}>
            <span style={{ fontSize: '18px' }}>📄</span>
            <span style={{
              fontSize: '13px', color: '#666',
              maxWidth: '200px', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{filename}</span>
          </div>
        )}

        {reason && (
          <div style={{
            background: '#fff', padding: '16px 20px', borderRadius: '10px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            marginBottom: '24px', fontSize: '14px', color: '#555',
            textAlign: 'left', lineHeight: 1.6,
          }}>
            <strong style={{ color: '#000' }}>What we found:</strong> {reason}
          </div>
        )}

        <div style={{
          background: '#fff', padding: '20px 24px', borderRadius: '10px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          marginBottom: '28px', textAlign: 'left',
        }}>
          <h3 style={{
            fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.5px', color: '#999', marginBottom: '12px',
          }}>We can analyze:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {[
              'Non-Disclosure Agreements (NDAs)',
              'Service Agreements & MSAs',
              'Software License Agreements',
              'Employment & Consulting Agreements',
              'Vendor & Purchase Agreements',
            ].map((item) => (
              <li key={item} style={{
                fontSize: '13px', color: '#333', padding: '3px 0',
              }}>{item}</li>
            ))}
          </ul>
        </div>

        <button onClick={onTryAgain} style={{
          padding: '14px 32px', borderRadius: '9999px', border: 'none',
          background: '#000', color: '#fff', fontSize: '14px', fontWeight: 600,
          cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          transition: 'all 0.15s ease',
        }}>
          Try Another Document
        </button>
      </div>

      {/* Floating decoration */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '3rem', opacity: 0.08 }}>📄</div>
        <div style={{ position: 'absolute', top: '60%', right: '15%', fontSize: '3rem', opacity: 0.08 }}>📋</div>
        <div style={{ position: 'absolute', bottom: '20%', left: '20%', fontSize: '3rem', opacity: 0.08 }}>📑</div>
      </div>
    </div>
  );
}
