// Mobile — déclinaison 390px (style Direction A, dark)
function MobileA() {
  const t = SYN_DARK;
  return (
    <div style={{ width: "100%", height: "100%", background: t.page, fontFamily: SYN_FONT, color: t.text, fontVariantNumeric: "tabular-nums", display: "flex", flexDirection: "column" }}>
      {/* Status bar fake spacing + header */}
      <div style={{ padding: "18px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <SynLogo t={t} size={14} sub={false} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ border: `1px solid ${t.border}`, borderRadius: 6, padding: "5px 9px", fontSize: 10.5, color: t.textMuted }}>EUR ▾</div>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.goldDim, color: t.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>JL</div>
        </div>
      </div>
      {/* Scope pill scroller */}
      <div style={{ display: "flex", gap: 6, padding: "14px 18px 0", overflow: "hidden" }}>
        {["Consolidé", "Par UBO", "Par entité", "Par banque", "Net de dette"].map((s, i) => (
          <span key={i} style={{ fontSize: 10.5, fontWeight: 600, padding: "6px 11px", borderRadius: 14, whiteSpace: "nowrap", color: i === 0 ? t.page : t.textMuted, background: i === 0 ? t.gold : t.card, border: i === 0 ? "none" : `1px solid ${t.border}` }}>{s}</span>
        ))}
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {/* Hero */}
        <div>
          <SynLabel t={t} color={t.gold} size={9} style={{ marginBottom: 6 }}>Patrimoine consolidé · 11/06/2026</SynLabel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em" }}>{FDL.netWorth}</span>
            <SynBadge t={t} tone="teal">{FDL.perf1y} 1 an</SynBadge>
          </div>
          <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>{FDL.grossAssets} bruts − {FDL.totalDebt} de dette</div>
        </div>
        <SynLine t={t} series={FDL.netWorthSeries} h={86} />
        {/* KPI grid 2 col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {[
            ["PV latentes", FDL.unrealizedGains, t.teal, FDL.unrealizedPct],
            ["Dette totale", FDL.totalDebt, t.text, `LTV ${FDL.ltv}`],
            ["Cash dispo", FDL.cash, t.text, `+ ${FDL.undrawn} non tirés`],
            ["TRI net de dette", FDL.irrLevered, t.teal, `TRI brut ${FDL.irr}`],
          ].map((k, i) => (
            <SynCard t={t} key={i} pad={13}>
              <SynLabel t={t} size={8.5} style={{ marginBottom: 6 }}>{k[0]}</SynLabel>
              <div style={{ fontSize: 16.5, fontWeight: 600, color: k[2] }}>{k[1]}</div>
              <div style={{ fontSize: 9.5, color: t.textFaint, marginTop: 3 }}>{k[3]}</div>
            </SynCard>
          ))}
        </div>
        {/* Allocation compacte */}
        <SynCard t={t} pad={14}>
          <SynLabel t={t} size={9} style={{ marginBottom: 10 }}>Allocation</SynLabel>
          <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
            {FDL.allocation.map((a, i) => (
              <div key={i} style={{ width: `${a.pct}%`, background: SYN_ALLOC_COLORS.dark[a.key] }}></div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {FDL.allocation.slice(0, 4).map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: SYN_ALLOC_COLORS.dark[a.key], flexShrink: 0 }}></span>
                <span style={{ color: t.textMuted, flex: 1 }}>{a.label}</span>
                <span style={{ fontWeight: 600 }}>{a.value}</span>
              </div>
            ))}
          </div>
        </SynCard>
        {/* Alerte principale */}
        <SynCard t={t} pad={13} style={{ borderLeft: `2px solid ${t.amber}` }}>
          <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: t.amber }}></span>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600 }}>Covenant LTV proche du seuil</div>
              <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 1, lineHeight: 1.45 }}>Financière du Louvre — 54,0 % / seuil 55 %</div>
            </div>
            <span style={{ marginLeft: "auto", color: t.textFaint }}>›</span>
          </div>
        </SynCard>
      </div>
      {/* Tab bar */}
      <div style={{ borderTop: `1px solid ${t.borderSoft}`, background: t.sidebar, display: "flex", justifyContent: "space-around", padding: "10px 8px 22px", flexShrink: 0 }}>
        {[["◫", "Dashboard", true], ["≣", "Portefeuille"], ["◍", "Dette"], ["◎", "Exposition"], ["▤", "Plus"]].map((n, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 52 }}>
            <span style={{ fontSize: 16, color: n[2] ? t.gold : t.textFaint }}>{n[0]}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: n[2] ? t.gold : t.textFaint }}>{n[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.MobileA = MobileA;
