// Direction B — "Clair institutionnel" : fond clair, navigation horizontale, plus aérée (Finary-like)
function DirectionB({ dark }) {
  const t = dark ? SYN_DARK : SYN_LIGHT;
  const navItems = ["Dashboard", "Portefeuille", "PV latentes", "Immobilier", "Dette & Levier", "Exposition", "Imports"];
  const stats = [
    { label: "Actifs bruts", value: FDL.grossAssets },
    { label: "Dette totale", value: FDL.totalDebt, sub: `LTV ${FDL.ltv}` },
    { label: "PV latentes", value: FDL.unrealizedGains, accent: t.teal, sub: FDL.unrealizedPct },
    { label: "Cash disponible", value: FDL.cash, sub: `+ ${FDL.undrawn} non tirés` },
    { label: "TRI net de dette", value: FDL.irrLevered, accent: t.teal },
    { label: "Revenus 12 mois", value: FDL.incomes12m },
  ];
  return (
    <div style={{ width: "100%", height: "100%", background: t.page, fontFamily: SYN_FONT, color: t.text, fontVariantNumeric: "tabular-nums", display: "flex", flexDirection: "column" }}>
      {/* Top nav */}
      <div style={{ background: t.sidebar, borderBottom: `1px solid ${t.border}`, padding: "0 32px", display: "flex", alignItems: "center", gap: 28, height: 58, flexShrink: 0 }}>
        <SynLogo t={t} size={15} sub={false} />
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {navItems.map((n, i) => (
            <div key={i} style={{ fontSize: 12.5, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? t.text : t.textMuted, padding: "7px 12px", borderRadius: 6, background: i === 0 ? t.page : "transparent" }}>{n}</div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${t.border}`, borderRadius: 7, padding: "6px 11px", fontSize: 12, fontWeight: 600 }}>
            <span style={{ color: t.gold }}>◈</span> Consolidé global <span style={{ color: t.textFaint }}>▾</span>
          </div>
          <div style={{ border: `1px solid ${t.border}`, borderRadius: 7, padding: "6px 11px", fontSize: 12, color: t.textMuted }}>EUR ▾</div>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: t.goldDim, color: t.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>JL</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: "30px 32px", maxWidth: 1440, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Hero */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <SynLabel t={t} color={t.gold} style={{ marginBottom: 8 }}>Famille de Launay · Patrimoine consolidé · 11 juin 2026</SynLabel>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.02em" }}>{FDL.netWorth}</span>
              <SynBadge t={t} tone="teal" style={{ fontSize: 12, padding: "4px 10px" }}>{FDL.perf1y} sur 1 an</SynBadge>
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 6 }}>Valeur nette de dette · {FDL.grossAssets} bruts − {FDL.totalDebt} de dette</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ border: `1px solid ${t.border}`, background: t.card, borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, color: t.textMuted }}>⇩ Export PDF</div>
            <div style={{ background: t.text, color: t.page, borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600 }}>+ Ajouter un actif</div>
          </div>
        </div>

        {/* Stat row — sans chrome, séparateurs verticaux */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: "18px 0" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: "0 22px", borderLeft: i > 0 ? `1px solid ${t.borderSoft}` : "none" }}>
              <SynLabel t={t} size={9.5} style={{ marginBottom: 7 }}>{s.label}</SynLabel>
              <div style={{ fontSize: 19, fontWeight: 600, color: s.accent || t.text }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 3 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Chart + allocation */}
        <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 18 }}>
          <SynCard t={t} pad={24} style={{ borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Évolution de la valeur nette</div>
              <div style={{ display: "flex", gap: 4 }}>
                {["YTD", "1A", "3A", "5A", "Max"].map((p, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, color: i === 1 ? t.text : t.textFaint, background: i === 1 ? t.page : "transparent", border: i === 1 ? `1px solid ${t.border}` : "1px solid transparent" }}>{p}</span>
                ))}
              </div>
            </div>
            <SynLine t={t} series={FDL.netWorthSeries} h={150} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10.5, color: t.textFaint }}>
              <span>Juil. 2024</span><span>Janv. 2025</span><span>Juil. 2025</span><span>Janv. 2026</span><span>Juin 2026</span>
            </div>
          </SynCard>
          <SynCard t={t} pad={24} style={{ borderRadius: 12 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 16 }}>Allocation</div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <SynDonut t={t} data={FDL.allocation} size={140} stroke={18} centerTop="84,2 M€" centerBottom="BRUT" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FDL.allocation.slice(0, 4).map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: SYN_ALLOC_COLORS[t.name][a.key], flexShrink: 0 }}></span>
                  <span style={{ color: t.textMuted, flex: 1 }}>{a.label}</span>
                  <span style={{ fontWeight: 600 }}>{a.value}</span>
                </div>
              ))}
              <div style={{ fontSize: 11.5, color: t.textFaint }}>+ Cash, assurance-vie…</div>
            </div>
          </SynCard>
        </div>

        {/* Dette / PV / Alertes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
          <SynCard t={t} pad={24} style={{ borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Dette & levier</div>
              <SynBadge t={t} tone="teal">LTV {FDL.ltv}</SynBadge>
            </div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{FDL.totalDebt}</div>
            <div style={{ fontSize: 11.5, color: t.textMuted, marginTop: 3, marginBottom: 14 }}>Coût moyen {FDL.wacd} · maturité moy. 6,2 ans</div>
            <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ width: "70.5%", background: t.gold }}></div>
              <div style={{ width: "18.7%", background: t.blue }}></div>
              <div style={{ width: "10.8%", background: t.textFaint }}></div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
              {[["Immobilière", FDL.debtRE, t.gold], ["Lombard", FDL.debtLombard, t.blue], ["Corporate", FDL.debtCorp, t.textFaint]].map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: d[2], flexShrink: 0 }}></span>
                  <span style={{ color: t.textMuted, flex: 1 }}>{d[0]}</span>
                  <span style={{ fontWeight: 600 }}>{d[1]}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.borderSoft}`, fontSize: 11.5, color: t.textMuted, display: "flex", justifyContent: "space-between" }}>
              <span>Échéances 24 mois</span><span style={{ fontWeight: 600, color: t.text }}>{FDL.mat24}</span>
            </div>
          </SynCard>
          <SynCard t={t} pad={24} style={{ borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Plus-values latentes</div>
              <span style={{ fontSize: 11, color: t.blue, fontWeight: 600 }}>Détail →</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 24, fontWeight: 600, color: t.teal }}>{FDL.unrealizedGains}</span>
              <SynBadge t={t} tone="teal">{FDL.unrealizedPct}</SynBadge>
            </div>
            <div style={{ fontSize: 11.5, color: t.textMuted, marginTop: 3, marginBottom: 12 }}>Nettes de dette : {FDL.unrealizedNetDebt}</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[["Immobilier", "+9,2 M€"], ["Coté (titres & ETF)", "+6,1 M€"], ["PE & fonds", "+3,4 M€"], ["Participations privées", "+1,1 M€"]].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 3 ? `1px solid ${t.borderSoft}` : "none", fontSize: 12 }}>
                  <span style={{ color: t.textMuted }}>{r[0]}</span>
                  <span style={{ fontWeight: 600, color: t.teal }}>{r[1]}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <SynBadge t={t} tone="amber">Part taxable indicative ≈ 7,4 M€</SynBadge>
            </div>
          </SynCard>
          <SynCard t={t} pad={24} style={{ borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Alertes</div>
              <SynBadge t={t} tone="amber">4</SynBadge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {FDL.alerts.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: a.tone === "red" ? t.red : a.tone === "amber" ? t.amber : t.blue }}></span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1, lineHeight: 1.5 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </SynCard>
        </div>
      </div>
    </div>
  );
}

window.DirectionB = DirectionB;
