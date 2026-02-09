'use client';

import Image from 'next/image';

/**
 * Shared v2 navigation bar used across all pages.
 * Renders the Consello logo image, pill-style nav tabs.
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
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image
            src="/consello-logo.jpg"
            alt="Consello"
            width={120}
            height={34}
            style={{ objectFit: 'contain' }}
            priority
          />
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
      {/* Right side spacer to keep nav centered-ish */}
      <div style={{ width: "120px" }} />
    </nav>
  );
}
