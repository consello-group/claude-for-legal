'use client';

/**
 * Shared v2 navigation bar used across all pages.
 * Renders the Consello box logo, pill-style nav tabs, and user avatar.
 */
export default function NavBar({ activePage = 'analyze', onLogout }) {
  const pages = [
    { label: 'Analyze', href: '/', id: 'analyze' },
    { label: 'Playbook', href: '/playbook', id: 'playbook' },
    { label: 'About', href: '/about', id: 'about' },
  ];

  return (
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
      fontFamily: "'DM Sans', Arial, sans-serif",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <div style={{
            width: "32px", height: "32px", background: "#000",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontSize: "7px", fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase" }}>
              Consello
            </span>
          </div>
        </a>
        <div style={{ display: "flex", gap: "2px" }}>
          {pages.map((item) => (
            <a key={item.id} href={item.href} style={{
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: "9999px",
              background: activePage === item.id ? "#000" : "transparent",
              color: activePage === item.id ? "#fff" : "#666",
              transition: "all 0.15s ease",
            }}>{item.label}</a>
          ))}
        </div>
      </div>
      {onLogout ? (
        <div
          onClick={onLogout}
          title="Logout"
          style={{
            width: "30px", height: "30px", borderRadius: "50%", background: "#000",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "11px", fontWeight: 600, color: "#fff", cursor: "pointer",
          }}
        >DM</div>
      ) : (
        <div style={{ width: "30px" }} />
      )}
    </nav>
  );
}
