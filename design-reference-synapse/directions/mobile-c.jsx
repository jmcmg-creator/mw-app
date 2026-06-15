// Mobile — déclinaison 390px Direction C (cockpit décisionnel, risque au premier plan)
function MobileC() {
  const t = SYN_DARK;
  return (
    <div style={{ width: "100%", height: "100%", background: t.page, fontFamily: SYN_FONT, color: t.text, fontVariantNumeric: "tabular-nums", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <SynLabel t={t} color={t.gold} size={8.5}>Cockpit patrimonial</SynLabel>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>Famille de Launay</div>
        </div>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.goldDim, color: t.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>JL</div>
      </div>
      {/* Ask bar */}
      <div style={{ margin: "14px 18px 0", display: "flex", alignItems: "center", gap: 9, background: t.card, border: `1px solid ${t.border}`, borderRadius: 9, padding: "10px 13px", color: t.textFaint, fontSize: 12 }}>
        <span style={{ color: t.gold }}>⌕</span> Quelle est mon exposition à…
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        {/* Net worth + scope */}
        <SynCard t={t} pad={16} style={{ background: `linear-gradient(135deg, ${t.card}, #131A28)` }}>
          <SynLabel t={t} size={9} style={{ marginBottom: 7 }}>Valeur nette consolidée</SynLabel>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em" }}>{FDL.netWorth}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <SynBadge t={t} tone="teal">{FDL.ytd} YTD</SynBadge>
            <SynBadge t={t} tone="teal">TRI {FDL.irr}</SynBadge>
            <SynBadge t={t} tone="neutral">Levier net 0,49×</SynBadge>
          </div>
        </SynCard>
        {/* KPI risque 2col */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {[
            ["LTV global", FDL.ltv, "Dette / actifs bruts"],
            ["Coût moyen dette", FDL.wacd, `${FDL.interests12m} 12 m.`],
            ["Liquidité mobilisable", "11,4 M€", "Cash + lignes"],
            ["Actifs non grevés", "41,7 M€", "49,5 % du brut"],
          ].map((k, i) => (
            <SynCard t={t} key={i} pad={13}>
              <SynLabel t={t} size={8.5} style={{ marginBottom: 6 }}>{k[0]}</SynLabel>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{k[1]}</div>
              <div style={{ fontSize: 9, color: t.textFaint, marginTop: 3 }}>{k[2]}</div>
            </SynCard>
          ))}
        </div>
        {/* Lombard risk */}
        <SynCard t={t} pad={15} style={{ borderLeft: `2px solid ${t.blue}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <SynLabel t={t} size={9}>Risque Lombard — UBS</SynLabel>
            <SynBadge t={t} tone="teal">Healthy</SynBadge>
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 13 }}>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 600 }}>{FDL.lombardDrawn}</div>
              <div style={{ fontSize: 9, color: t.textFaint }}>tirés / {FDL.lombardLine}</div>
            </div>
            <div>
              <div style={{ fontSize: 15.5, fontWeight: 600, color: t.teal }}>{FDL.lombardMargin}</div>
              <div style={{ fontSize: 9, color: t.textFaint }}>marge avant max</div>
            </div>
          </div>
          <div style={{ position: "relative", height: 9, borderRadius: 5, background: t.rowHover }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: "41.2%", height: "100%", background: t.teal }}></div>
            </div>
            <div style={{ position: "absolute", left: "60%", top: -3, bottom: -3, width: 2, background: t.amber }}></div>
            <div style={{ position: "absolute", left: "68%", top: -3, bottom: -3, width: 2, background: t.red }}></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 9 }}>
            <span style={{ color: t.teal, fontWeight: 600 }}>LTV 41,2 %</span>
            <span style={{ color: t.amber }}>Max 60 %</span>
            <span style={{ color: t.red }}>Appel 68 %</span>
          </div>
        </SynCard>
        {/* Covenants */}
        <SynCard t={t} pad={15}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <SynLabel t={t} size={9}>Covenants</SynLabel>
            <SynBadge t={t} tone="amber">1 à surveiller</SynBadge>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { name: "LTV — Financière du Louvre", tone: "amber", st: "Watch" },
              { name: "DSCR — SAS Palace", tone: "teal", st: "Healthy" },
              { name: "LTV — Lombard UBS", tone: "teal", st: "Healthy" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < 2 ? `1px solid ${t.borderSoft}` : "none", fontSize: 11 }}>
                <span style={{ flex: 1, fontWeight: 600 }}>{c.name}</span>
                <SynBadge t={t} tone={c.tone}>{c.st}</SynBadge>
              </div>
            ))}
          </div>
        </SynCard>
      </div>
      <div style={{ borderTop: `1px solid ${t.borderSoft}`, background: t.sidebar, display: "flex", justifyContent: "space-around", padding: "10px 8px 22px", flexShrink: 0 }}>
        {[["◫", "Cockpit", true], ["≣", "Portef."], ["◍", "Dette"], ["◎", "Exposition"], ["▤", "Plus"]].map((n, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 52 }}>
            <span style={{ fontSize: 16, color: n[2] ? t.gold : t.textFaint }}>{n[0]}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: n[2] ? t.gold : t.textFaint }}>{n[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.MobileC = MobileC;
