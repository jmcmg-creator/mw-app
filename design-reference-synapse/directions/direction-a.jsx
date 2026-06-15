// Direction A — "Héritage Synapse" : fidèle au produit existant, dark, or + teal
function DirectionA() {
  const t = SYN_DARK;
  const nav = [
    { label: "Dashboard", active: true, icon: "◫" },
    { label: "Portefeuille", icon: "≣" },
    { label: "Plus-values latentes", icon: "↗" },
    { label: "Immobilier", icon: "⌂" },
    { label: "Dette & Levier", icon: "◍" },
    { label: "Exposition", icon: "◎" },
    { label: "Imports", icon: "⇪" },
    { label: "Documents", icon: "▤" },
  ];
  const kpis = [
    { label: "Valeur nette (11/06/2026)", value: FDL.netWorth, accent: t.teal },
    { label: "Actifs bruts", value: FDL.grossAssets },
    { label: "Dette totale", value: FDL.totalDebt },
    { label: "LTV global", value: null, badge: FDL.ltv, tone: "teal" },
    { label: "PV latentes", value: FDL.unrealizedGains, accent: t.teal, sub: FDL.unrealizedPct },
    { label: "Cash disponible", value: FDL.cash, sub: `+ ${FDL.undrawn} non tirés` },
  ];
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: t.page, fontFamily: SYN_FONT, color: t.text, fontVariantNumeric: "tabular-nums" }}>
      {/* Sidebar */}
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
          {nav.map((n, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 7, fontSize: 12.5, fontWeight: n.active ? 600 : 500, color: n.active ? t.gold : t.textMuted, background: n.active ? t.goldDim : "transparent", border: n.active ? `1px solid ${t.gold}33` : "1px solid transparent" }}>
              <span style={{ fontSize: 13, width: 16, textAlign: "center", opacity: 0.9 }}>{n.icon}</span>{n.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, padding: "20px 26px 26px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Scope bar */}
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
          <SynBadge t={t} tone="neutral">Données au 11/06/2026</SynBadge>
          <div style={{ border: `1px solid ${t.gold}66`, color: t.gold, borderRadius: 7, padding: "7px 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>⇩ Export PDF</div>
        </div>

        {/* Title */}
        <div>
          <SynLabel t={t} color={t.gold} style={{ marginBottom: 5 }}>Patrimoine consolidé</SynLabel>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>Dashboard</div>
          <div style={{ display: "flex", gap: 22, marginTop: 12, borderBottom: `1px solid ${t.borderSoft}` }}>
            {["Synthèse", "Allocation", "Performance", "Risque"].map((tab, i) => (
              <div key={i} style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: i === 0 ? t.gold : t.textMuted, paddingBottom: 9, borderBottom: i === 0 ? `2px solid ${t.gold}` : "2px solid transparent" }}>{tab}</div>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {kpis.map((k, i) => (
            <SynCard t={t} key={i} pad={14}>
              <SynLabel t={t} size={9.5} style={{ marginBottom: 8 }}>{k.label}</SynLabel>
              {k.badge ? <SynBadge t={t} tone={k.tone} style={{ fontSize: 14, padding: "4px 10px" }}>{k.badge}</SynBadge>
                : <div style={{ fontSize: 19, fontWeight: 600, color: k.accent || t.text }}>{k.value}</div>}
              {k.sub && <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 4 }}>{k.sub}</div>}
            </SynCard>
          ))}
        </div>

        {/* Row 2 : net worth + allocation */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
          <SynCard t={t}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <SynLabel t={t} style={{ marginBottom: 6 }}>Valeur nette — 24 mois</SynLabel>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 600 }}>{FDL.netWorth}</span>
                  <SynBadge t={t} tone="teal">{FDL.perf1y} sur 1 an</SynBadge>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {["YTD", "1A", "3A", "5A", "Max"].map((p, i) => (
                  <span key={i} style={{ fontSize: 10.5, fontWeight: 600, padding: "4px 9px", borderRadius: 5, color: i === 1 ? t.text : t.textFaint, background: i === 1 ? t.rowHover : "transparent", border: i === 1 ? `1px solid ${t.border}` : "1px solid transparent" }}>{p}</span>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 14 }}><SynLine t={t} series={FDL.netWorthSeries} h={128} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: t.textFaint }}>
              <span>Juil. 2024</span><span>Janv. 2025</span><span>Juil. 2025</span><span>Janv. 2026</span><span>Juin 2026</span>
            </div>
            <div style={{ display: "flex", gap: 26, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.borderSoft}` }}>
              {[["TRI global", FDL.irr], ["TRI net de dette", FDL.irrLevered], ["Perf. YTD", FDL.ytd], ["Revenus 12 mois", FDL.incomes12m]].map((m, i) => (
                <div key={i}>
                  <SynLabel t={t} size={9} style={{ marginBottom: 4 }}>{m[0]}</SynLabel>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: t.teal }}>{m[1]}</div>
                </div>
              ))}
            </div>
          </SynCard>
          <SynCard t={t}>
            <SynLabel t={t} style={{ marginBottom: 14 }}>Allocation par classe d'actif</SynLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <SynDonut t={t} data={FDL.allocation} centerTop="84,2 M€" centerBottom="BRUT" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                {FDL.allocation.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: SYN_ALLOC_COLORS.dark[a.key], flexShrink: 0 }}></span>
                    <span style={{ color: t.textMuted, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.label}</span>
                    <span style={{ fontWeight: 600 }}>{a.value}</span>
                    <span style={{ color: t.textFaint, width: 42, textAlign: "right" }}>{String(a.pct).replace(".", ",")} %</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.borderSoft}`, display: "flex", gap: 8 }}>
              {["Par UBO", "Par entité", "Par banque", "Par devise"].map((s, i) => (
                <span key={i} style={{ fontSize: 10.5, fontWeight: 600, padding: "4px 10px", borderRadius: 5, border: `1px solid ${t.border}`, color: i === 0 ? t.gold : t.textMuted, background: i === 0 ? t.goldDim : "transparent" }}>{s}</span>
              ))}
            </div>
          </SynCard>
        </div>

        {/* Row 3 : dette + PV latentes + alertes */}
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr 1fr", gap: 12 }}>
          <SynCard t={t}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SynLabel t={t}>Dette & levier</SynLabel>
              <SynBadge t={t} tone="teal">LTV {FDL.ltv}</SynBadge>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{FDL.totalDebt}</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>Coût moyen pondéré {FDL.wacd} · intérêts 12 mois {FDL.interests12m}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 12 }}>
              {[["Immobilière", FDL.debtRE, 70.5, t.gold], ["Lombard", FDL.debtLombard, 18.7, t.blue], ["Corporate", FDL.debtCorp, 10.8, t.textFaint]].map((d, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
                    <span style={{ color: t.textMuted }}>{d[0]}</span><span style={{ fontWeight: 600 }}>{d[1]}</span>
                  </div>
                  <div style={{ height: 4, background: t.rowHover, borderRadius: 2 }}>
                    <div style={{ width: `${d[2]}%`, height: "100%", background: d[3], borderRadius: 2 }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.borderSoft}` }}>
              <SynLabel t={t} size={9} style={{ marginBottom: 8 }}>Maturités (M€)</SynLabel>
              <SynBars t={t} data={FDL.maturitySeries} h={74} highlightIdx={1} />
            </div>
          </SynCard>
          <SynCard t={t}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SynLabel t={t}>Plus-values latentes</SynLabel>
              <span style={{ fontSize: 10.5, color: t.blue, fontWeight: 600 }}>Voir le détail →</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: t.teal }}>{FDL.unrealizedGains}</span>
              <SynBadge t={t} tone="teal">{FDL.unrealizedPct}</SynBadge>
            </div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>Nettes de dette : {FDL.unrealizedNetDebt}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 10 }}>
              {[["Immobilier", "+9,2 M€", "+31,4 %"], ["Coté (titres & ETF)", "+6,1 M€", "+37,4 %"], ["Private equity & fonds", "+3,4 M€", "+40,5 %"], ["Participations privées", "+1,1 M€", "+19,0 %"]].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < 3 ? `1px solid ${t.borderSoft}` : "none", fontSize: 11.5 }}>
                  <span style={{ color: t.textMuted, flex: 1 }}>{r[0]}</span>
                  <span style={{ fontWeight: 600, color: t.teal }}>{r[1]}</span>
                  <span style={{ color: t.textFaint, width: 52, textAlign: "right" }}>{r[2]}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 6, alignItems: "center" }}>
              <SynBadge t={t} tone="amber">Part taxable indic. ≈ 7,4 M€</SynBadge>
              <SynBadge t={t} tone="neutral">Confiance : haute</SynBadge>
            </div>
          </SynCard>
          <SynCard t={t}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SynLabel t={t}>Alertes</SynLabel>
              <SynBadge t={t} tone="amber">4</SynBadge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {FDL.alerts.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: a.tone === "red" ? t.red : a.tone === "amber" ? t.amber : t.blue }}></span>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600 }}>{a.title}</div>
                    <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 1, lineHeight: 1.45 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </SynCard>
        </div>

        {/* Row 4 : top contributeurs */}
        <SynCard t={t} pad={0} style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px" }}>
            <SynLabel t={t}>Top contributeurs à la performance — 12 mois</SynLabel>
            <span style={{ fontSize: 10.5, color: t.blue, fontWeight: 600 }}>Portefeuille complet →</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${t.borderSoft}` }}>
            <div>
              {FDL.topContrib.slice(0, 3).map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", borderBottom: i < 2 ? `1px solid ${t.borderSoft}` : "none", fontSize: 12 }}>
                  <span style={{ color: t.textFaint, fontSize: 10.5, width: 14 }}>{i + 1}</span>
                  <span style={{ fontWeight: 600, flex: 1 }}>{c.name}</span>
                  <span style={{ color: t.blue, fontSize: 11 }}>{c.entity}</span>
                  <span style={{ fontWeight: 600, color: t.teal, width: 72, textAlign: "right" }}>{c.amount}</span>
                </div>
              ))}
            </div>
            <div style={{ borderLeft: `1px solid ${t.borderSoft}` }}>
              {FDL.topDetract.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", borderBottom: i < 2 ? `1px solid ${t.borderSoft}` : "none", fontSize: 12 }}>
                  <span style={{ color: t.textFaint, fontSize: 10.5, width: 14 }}>{i + 1}</span>
                  <span style={{ fontWeight: 600, flex: 1 }}>{c.name}</span>
                  <span style={{ color: t.blue, fontSize: 11 }}>{c.entity}</span>
                  <span style={{ fontWeight: 600, color: t.red, width: 72, textAlign: "right" }}>{c.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </SynCard>
      </div>
    </div>
  );
}

window.DirectionA = DirectionA;
