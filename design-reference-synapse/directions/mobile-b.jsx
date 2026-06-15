// Mobile — déclinaison 390px Direction B (clair institutionnel)
function MobileB({ dark }) {
  const t = dark ? SYN_DARK : SYN_LIGHT;
  return (
    <div style={{ width: "100%", height: "100%", background: t.page, fontFamily: SYN_FONT, color: t.text, fontVariantNumeric: "tabular-nums", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <SynLogo t={t} size={14} sub={false} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ border: `1px solid ${t.border}`, borderRadius: 6, padding: "5px 9px", fontSize: 10.5, color: t.textMuted }}>EUR ▾</div>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.goldDim, color: t.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>JL</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 7, padding: "14px 18px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: "6px 12px", fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap" }}>
          <span style={{ color: t.gold }}>◈</span> Consolidé global ▾
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 600, padding: "6px 12px", borderRadius: 16, whiteSpace: "nowrap", color: t.textMuted, background: t.card, border: `1px solid ${t.border}` }}>Look-through</span>
      </div>
      <div style={{ padding: "18px 18px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <div>
          <SynLabel t={t} color={t.gold} size={9} style={{ marginBottom: 6 }}>Famille de Launay · 12 juin 2026</SynLabel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em" }}>{FDL.netWorth}</span>
            <SynBadge t={t} tone="teal">{FDL.perf1y}</SynBadge>
          </div>
          <div style={{ fontSize: 11.5, color: t.textMuted, marginTop: 5 }}>Valeur nette · {FDL.grossAssets} − {FDL.totalDebt}</div>
        </div>
        <SynCard t={t} pad={18} style={{ borderRadius: 12 }}>
          <SynLine t={t} series={FDL.netWorthSeries} h={92} />
          <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
            {["YTD", "1A", "3A", "5A", "Max"].map((p, i) => (
              <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 10.5, fontWeight: 600, padding: "6px 0", borderRadius: 6, color: i === 1 ? t.text : t.textFaint, background: i === 1 ? t.page : "transparent", border: i === 1 ? `1px solid ${t.border}` : "1px solid transparent" }}>{p}</span>
            ))}
          </div>
        </SynCard>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            ["Actifs bruts", FDL.grossAssets, t.text, ""],
            ["Dette · LTV", FDL.totalDebt, t.text, `LTV ${FDL.ltv}`],
            ["PV latentes", FDL.unrealizedGains, t.teal, FDL.unrealizedPct],
            ["Cash dispo", FDL.cash, t.text, `+ ${FDL.undrawn}`],
          ].map((k, i) => (
            <SynCard t={t} key={i} pad={15} style={{ borderRadius: 12 }}>
              <SynLabel t={t} size={9} style={{ marginBottom: 7 }}>{k[0]}</SynLabel>
              <div style={{ fontSize: 18, fontWeight: 600, color: k[2] }}>{k[1]}</div>
              {k[3] && <div style={{ fontSize: 10, color: t.textMuted, marginTop: 3 }}>{k[3]}</div>}
            </SynCard>
          ))}
        </div>
        <SynCard t={t} pad={18} style={{ borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Allocation</div>
            <span style={{ fontSize: 11, color: t.blue, fontWeight: 600 }}>Détail →</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <SynDonut t={t} data={FDL.allocation} size={104} stroke={14} centerTop="84,2 M€" centerBottom="BRUT" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              {FDL.allocation.slice(0, 4).map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: SYN_ALLOC_COLORS[t.name][a.key], flexShrink: 0 }}></span>
                  <span style={{ color: t.textMuted, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</span>
                  <span style={{ fontWeight: 600 }}>{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SynCard>
      </div>
      <div style={{ borderTop: `1px solid ${t.border}`, background: t.sidebar, display: "flex", justifyContent: "space-around", padding: "10px 8px 22px", flexShrink: 0 }}>
        {[["◫", "Dashboard", true], ["≣", "Portef."], ["◍", "Dette"], ["◎", "Exposition"], ["▤", "Plus"]].map((n, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 52 }}>
            <span style={{ fontSize: 16, color: n[2] ? t.text : t.textFaint }}>{n[0]}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: n[2] ? t.text : t.textFaint }}>{n[1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.MobileB = MobileB;
