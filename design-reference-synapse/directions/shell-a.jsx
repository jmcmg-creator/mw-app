// Shell réutilisable Direction A (sidebar + scope bar) pour les écrans internes
function SynShellA({ active, title, eyebrow, children, t }) {
  t = t || SYN_DARK;
  const nav = [
    { label: "Dashboard", icon: "◫" },
    { label: "Portefeuille", icon: "≣" },
    { label: "Plus-values latentes", icon: "↗" },
    { label: "Immobilier", icon: "⌂" },
    { label: "Dette & Levier", icon: "◍" },
    { label: "Exposition", icon: "◎" },
    { label: "Imports", icon: "⇪" },
    { label: "Documents", icon: "▤" },
  ];
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: t.page, fontFamily: SYN_FONT, color: t.text, fontVariantNumeric: "tabular-nums" }}>
      <div style={{ width: 208, flexShrink: 0, background: t.sidebar, borderRight: `1px solid ${t.borderSoft}`, padding: "22px 14px", display: "flex", flexDirection: "column", gap: 18 }}>
        <SynLogo t={t} />
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.goldDim, color: t.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>JL</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>J. de Launay</div>
            <div style={{ fontSize: 10, color: t.textMuted }}>Family office</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map((n, i) => {
            const on = n.label === active;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 7, fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? t.gold : t.textMuted, background: on ? t.goldDim : "transparent", border: on ? `1px solid ${t.gold}33` : "1px solid transparent" }}>
                <span style={{ fontSize: 13, width: 16, textAlign: "center", opacity: 0.9 }}>{n.icon}</span>{n.label}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: "20px 26px 26px", display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.card, border: `1px solid ${t.border}`, borderRadius: 7, padding: "7px 12px", fontSize: 12, fontWeight: 600 }}>
            <span style={{ color: t.gold }}>◈</span> Consolidé global <span style={{ color: t.textFaint }}>▾</span>
          </div>
          {["UBO : Famille de Launay", "Mode : Look-through", "EUR"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: t.card, border: `1px solid ${t.border}`, borderRadius: 7, padding: "7px 12px", fontSize: 12, color: t.textMuted }}>
              {s} <span style={{ color: t.textFaint }}>▾</span>
            </div>
          ))}
          <div style={{ flex: 1 }}></div>
          <SynBadge t={t} tone="neutral">Données au 12/06/2026</SynBadge>
          <div style={{ border: `1px solid ${t.gold}66`, color: t.gold, borderRadius: 7, padding: "7px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>⇩ Export</div>
        </div>
        <div>
          {eyebrow && <SynLabel t={t} color={t.gold} style={{ marginBottom: 5 }}>{eyebrow}</SynLabel>}
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</div>
        </div>
        {children}
      </div>
    </div>
  );
}
window.SynShellA = SynShellA;
