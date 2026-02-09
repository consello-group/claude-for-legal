'use client';

export default function AuthScreen({ password, setPassword, authError, authLoading, onLogin }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#FAFAFA",
      fontFamily: "'DM Sans', Arial, sans-serif",
    }}>
      <div style={{
        background: "#fff",
        padding: "48px 40px",
        borderRadius: "16px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.04)",
        textAlign: "center",
        maxWidth: "380px",
        width: "100%",
        margin: "16px",
      }}>
        {/* Logo */}
        <div style={{
          width: "40px", height: "40px", background: "#000",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <span style={{ color: "#fff", fontSize: "8px", fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
            Consello
          </span>
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.3px", marginBottom: "6px" }}>
          Legal Document Analysis
        </h1>
        <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>
          Enter password to access
        </p>

        <form onSubmit={onLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{
              padding: "12px 16px",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "10px",
              fontSize: "14px",
              fontFamily: "'DM Sans', Arial, sans-serif",
              textAlign: "center",
              outline: "none",
              transition: "border-color 0.15s ease",
            }}
          />
          {authError && (
            <p style={{ fontSize: "13px", color: "#C62828", fontWeight: 500, margin: 0 }}>{authError}</p>
          )}
          <button
            type="submit"
            disabled={authLoading}
            style={{
              padding: "13px",
              borderRadius: "9999px",
              border: "none",
              background: "#000",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: authLoading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', Arial, sans-serif",
              opacity: authLoading ? 0.7 : 1,
              transition: "all 0.15s ease",
            }}
          >
            {authLoading ? 'Authenticating...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
