// Direction C — "Cockpit décisionnel" : dark, hiérarchie alternative orientée risque & décision
function SynWaterfallC({ t }) {
  // valeurs en M€ : brut 84,2 → -19,6 → -5,2 → -3,0 → net 56,4
  const w = 560, h = 210, padB = 26, max = 90;
  const steps = [
    { label: "Actifs bruts", from: 0, to: 84.2, col: t.gold, val: "84,2" },
    { label: "Dette immo.", from: 84.2, to: 64.6, col: t.red, val: "−19,6" },
    { label: "Lombard", from: 64.6, to: 59.4, col: t.red, val: "−5,2" },
    { label: "Corporate", from: 59.4, to: 56.4, col: t.red, val: "−3,0" },
    { label: "Valeur nette", from: 0, to: 56.4, col: t.teal, val: "56,4" },
  ];
  const bw = 72, gap = (w - bw * steps.length) / (steps.length - 1) - 0; // spread
  const y = (v) => (h - padB) - (v / max) * (h - padB - 14);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", width: "100%" }}>
      {steps.map((s, i) => {
        const x = i * (bw + gap);
        const yTop = y(Math.max(s.from, s.to));
        const yBot = y(Math.min(s.from, s.to));
        return (
          <g key={i}>
            <rect x={x} y={yTop} width={bw} height={Math.max(4, yBot - yTop)} rx="3" fill={s.col} opacity={s.col === t.red ? 0.85 : 1} />
            {i < steps.length - 1 && (
              <line x1={x + bw} y1={y(s.to)} x2={x + bw + gap} y2={y(s.to)} stroke={t.textFaint} strokeDasharray="3 3" strokeWidth="1" />
            )}
            <text x={x + bw / 2} y={yTop - 6} textAnchor="middle" fill={t.text} fontSize="12" fontWeight="600" fontFamily={SYN_FONT} style={{ fontVariantNumeric: "tabular-nums" }}>{s.val}</text>
            <text x={x + bw / 2} y={h - 8} textAnchor="middle" fill={t.textMuted} fontSize="10" fontFamily={SYN_FONT}>{s.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SynGaugeC({ t, pct = 41.2, max = 60, call = 68 }) {
  // jauge horizontale LTV Lombard
  return (
    <div>
      <div style={{ position: "relative", height: 10, borderRadius: 5, background: t.rowHover, overflow: "visible" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 5, overflow: "hidden" }}>
          <div style={{ width: `${(pct / 100) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${t.teal}, ${t.teal})` }}></div>
        </div>
        <div style={{ position: "absolute", left: `${max}%`, top: -4, bottom: -4, width: 2, background: t.amber }}></div>
        <div style={{ position: "absolute", left: `${call}%`, top: -4, bottom: -4, width: 2, background: t.red }}></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 10 }}>
        <span style={{ color: t.teal, fontWeight: 600 }}>LTV 41,2 %</span>
        <span style={{ color: t.amber }}>Max 60 %</span>
        <span style={{ color: t.red }}>Appel de marge 68 %</span>
      </div>
    </div>
  );
}

function DirectionC() {
  const t = SYN_DARK;
  const rail = ["◫", "≣", "↗", "⌂", "◍", "◎", "⇪", "▤"];
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: t.page, fontFamily: SYN_FONT, color: t.text, fontVariantNumeric: "tabular-nums" }}>
      {/* Rail icônes */}
      <div style={{ width: 56, flexShrink: 0, background: t.sidebar, borderRight: `1px solid ${t.borderSoft}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 18, gap: 6 }}>
        <div style={{ fontFamily: SYN_SERIF, fontSize: 19, fontWeight: 600, color: t.gold, marginBottom: 14 }}>S</div>
        {rail.map((ic, i) => (
          <div key={i} style={{ width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: i === 0 ? t.gold : t.textFaint, background: i === 0 ? t.goldDim : "transparent", border: i === 0 ? `1px solid ${t.gold}33` : "1px solid transparent" }}>{ic}</div>
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0, padding: "18px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Header : scope central + ask */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <SynLabel t={t} color={t.gold} size={9}>Cockpit patrimonial</SynLabel>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 2 }}>Famille de Launay</div>
          </div>
          <div style={{ display: "flex", background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: 3, marginLeft: 12 }}>
            {["Consolidé", "Par UBO", "Par entité", "Par banque", "Net de dette", "Dette seule"].map((s, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "6px 12px", borderRadius: 6, color: i === 0 ? t.page : t.textMuted, background: i === 0 ? t.gold : "transparent" }}>{s}</span>
            ))}
          </div>
          <div style={{ flex: 1 }}></div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, background: t.card, border: `1px solid ${t.border}`, borderRadius: 8, padding: "8px 14px", width: 320, color: t.textFaint, fontSize: 12 }}>
            <span style={{ color: t.gold }}>⌕</span> Quelle est mon exposition à… <span style={{ marginLeft: "auto", fontSize: 10, border: `1px solid ${t.border}`, borderRadius: 4, padding: "1px 5px" }}>⌘K</span>
          </div>
        </div>

        {/* Bandeau net worth */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 14 }}>
          <SynCard t={t} style={{ flex: "0 0 270px", display: "flex", flexDirection: "column", justifyContent: "center", background: `linear-gradient(135deg, ${t.card}, #131A28)` }}>
            <SynLabel t={t} size={9.5} style={{ marginBottom: 8 }}>Valeur nette consolidée</SynLabel>
            <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.01em" }}>{FDL.netWorth}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
              <SynBadge t={t} tone="teal">{FDL.ytd} YTD</SynBadge>
              <SynBadge t={t} tone="teal">TRI {FDL.irr}</SynBadge>
            </div>
          </SynCard>
          {[
            { label: "Levier net", value: "0,49×", sub: "Dette / valeur nette" },
            { label: "LTV global", value: FDL.ltv, sub: "Dette / actifs bruts" },
            { label: "Coût moyen dette", value: FDL.wacd, sub: `${FDL.interests12m} d'intérêts 12 m.` },
            { label: "Liquidité mobilisable", value: "11,4 M€", sub: "Cash + lignes + actifs nantissables" },
            { label: "Actifs non grevés", value: "41,7 M€", sub: "49,5 % des actifs bruts" },
          ].map((k, i) => (
            <SynCard t={t} key={i} pad={16} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <SynLabel t={t} size={9} style={{ marginBottom: 7 }}>{k.label}</SynLabel>
              <div style={{ fontSize: 21, fontWeight: 600 }}>{k.value}</div>
              <div style={{ fontSize: 10, color: t.textFaint, marginTop: 4, lineHeight: 1.4 }}>{k.sub}</div>
            </SynCard>
          ))}
        </div>

        {/* Corps : waterfall + rail risque */}
        <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 14, flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SynCard t={t}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <SynLabel t={t}>Du brut au net — pont de dette (M€)</SynLabel>
                <div style={{ display: "flex", gap: 6 }}>
                  <SynBadge t={t} tone="gold">Brut 84,2 M€</SynBadge>
                  <SynBadge t={t} tone="teal">Net 56,4 M€</SynBadge>
                </div>
              </div>
              <SynWaterfallC t={t} />
            </SynCard>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1 }}>
              <SynCard t={t}>
                <SynLabel t={t} style={{ marginBottom: 10 }}>Maturités de dette (M€)</SynLabel>
                <SynBars t={t} data={FDL.maturitySeries} h={86} highlightIdx={1} />
                <div style={{ marginTop: 10, fontSize: 11, color: t.textMuted, display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: t.amber }}></span>
                  Crédit relais 2,1 M€ à refinancer avant mars 2027
                </div>
              </SynCard>
              <SynCard t={t}>
                <SynLabel t={t} style={{ marginBottom: 12 }}>Top mouvements — 12 mois</SynLabel>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {[...FDL.topContrib.slice(0, 3), FDL.topDetract[0]].map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", borderBottom: i < 3 ? `1px solid ${t.borderSoft}` : "none", fontSize: 11.5 }}>
                      <span style={{ fontWeight: 600, flex: 1 }}>{c.name}</span>
                      <span style={{ fontWeight: 600, color: c.amount.startsWith("−") ? t.red : t.teal }}>{c.amount}</span>
                    </div>
                  ))}
                </div>
              </SynCard>
            </div>
          </div>

          {/* Rail risque */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SynCard t={t} style={{ borderLeft: `2px solid ${t.blue}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <SynLabel t={t}>Risque Lombard — UBS</SynLabel>
                <SynBadge t={t} tone="teal">Healthy</SynBadge>
              </div>
              <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{FDL.lombardDrawn}</div>
                  <div style={{ fontSize: 10, color: t.textFaint }}>tirés / {FDL.lombardLine}</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>12,6 M€</div>
                  <div style={{ fontSize: 10, color: t.textFaint }}>portefeuille nanti</div>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: t.teal }}>{FDL.lombardMargin}</div>
                  <div style={{ fontSize: 10, color: t.textFaint }}>marge avant max</div>
                </div>
              </div>
              <SynGaugeC t={t} />
              <div style={{ marginTop: 12, fontSize: 10.5, color: t.textMuted }}>Stress −20 % marchés → LTV 51,5 % · pas d'appel de marge</div>
            </SynCard>
            <SynCard t={t}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <SynLabel t={t}>Covenants</SynLabel>
                <SynBadge t={t} tone="amber">1 à surveiller</SynBadge>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { name: "LTV — Financière du Louvre", val: "54,0 % / 55 %", tone: "amber", st: "Watch" },
                  { name: "DSCR — SAS Palace", val: "3,64× / min 1,2×", tone: "teal", st: "Healthy" },
                  { name: "LTV — Lombard UBS", val: "41,2 % / 60 %", tone: "teal", st: "Healthy" },
                  { name: "Liquidité min. — Groupe FDL", val: "3,4 M€ / min 1,0 M€", tone: "teal", st: "Healthy" },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < 3 ? `1px solid ${t.borderSoft}` : "none", fontSize: 11.5 }}>
                    <span style={{ flex: 1, fontWeight: 600 }}>{c.name}</span>
                    <span style={{ color: t.textMuted, fontSize: 10.5 }}>{c.val}</span>
                    <SynBadge t={t} tone={c.tone}>{c.st}</SynBadge>
                  </div>
                ))}
              </div>
            </SynCard>
            <SynCard t={t} style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <SynLabel t={t}>Qualité de donnée</SynLabel>
                <SynBadge t={t} tone="red">2 critiques</SynBadge>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5 }}>
                {[
                  ["red", "Medtech SAS — prix de revient non documenté"],
                  ["red", "3 lots sans date d'achat fiable (CTO BNP)"],
                  ["amber", "Valorisation > 12 mois : Medtech SAS"],
                  ["amber", "Import UBS du 02/06 non réconcilié (écart 18 k€)"],
                ].map((q, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: q[0] === "red" ? t.red : t.amber }}></span>
                    <span style={{ color: t.textMuted, lineHeight: 1.45 }}>{q[1]}</span>
                  </div>
                ))}
              </div>
            </SynCard>
          </div>
        </div>
      </div>
    </div>
  );
}

window.DirectionC = DirectionC;
