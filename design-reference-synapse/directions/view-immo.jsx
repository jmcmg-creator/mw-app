// Vue Immobilier — Direction A
const RE_PROPS = [
  { name: "18 r. Fbg Montmartre", city: "Paris 9e", entity: "SAS Palace", own: "100 %", cost: "7,65 M€", value: "8,90 M€", debt: "4,20 M€", ltv: 47.2, rate: "1,85 %", mat: "2031", dscr: "3,64×", rent: "412 k€", yieldNet: "3,9 %", pv: "+0,72 M€", pvTone: "teal", conf: "high" },
  { name: "Le Castellane", city: "Neuilly-sur-Seine", entity: "Financière du Louvre", own: "100 %", cost: "11,20 M€", value: "13,40 M€", debt: "7,24 M€", ltv: 54.0, rate: "2,10 %", mat: "2029", dscr: "2,18×", rent: "548 k€", yieldNet: "3,4 %", pv: "+2,20 M€", pvTone: "teal", conf: "high" },
  { name: "Résidence Vauban", city: "Lyon 6e", entity: "SCI Rivoli", own: "60 %", cost: "4,30 M€", value: "5,10 M€", debt: "2,85 M€", ltv: 55.9, rate: "3,40 %", mat: "2027", dscr: "1,52×", rent: "236 k€", yieldNet: "3,1 %", pv: "+0,48 M€", pvTone: "teal", conf: "medium" },
  { name: "Plateau Haussmann", city: "Paris 8e", entity: "Patrimoine de Rivoli", own: "100 %", cost: "6,90 M€", value: "7,80 M€", debt: "2,10 M€", ltv: 26.9, rate: "var. E3M+1,1", mat: "2027", dscr: "n/a", rent: "0 k€", yieldNet: "— (relais)", pv: "+0,90 M€", pvTone: "teal", conf: "high" },
  { name: "Villa Méridienne", city: "Cap d'Antibes", entity: "Famille de Launay", own: "100 %", cost: "3,20 M€", value: "3,30 M€", debt: "1,01 M€", ltv: 30.6, rate: "1,95 %", mat: "2033", dscr: "n/a", rent: "0 k€", yieldNet: "usage perso.", pv: "+0,10 M€", pvTone: "teal", conf: "medium" },
];

function REtag({ t, conf }) {
  const map = { high: ["teal", "Haute"], medium: ["amber", "Moyenne"], low: ["red", "Faible"] };
  return <SynBadge t={t} tone={map[conf][0]}>{map[conf][1]}</SynBadge>;
}

function ViewImmo() {
  const t = SYN_DARK;
  const kpis = [
    { label: "Biens", value: "5" },
    { label: "Valeur de marché", value: "38,5 M€" },
    { label: "Dette immobilière", value: "17,4 M€", sub: "LTV moyen 45,2 %" },
    { label: "Equity value", value: "21,1 M€", accent: t.teal },
    { label: "Loyers 12 mois", value: "1,20 M€", sub: "NOI 0,94 M€" },
    { label: "Rendement net moy.", value: "3,5 %" },
    { label: "Cash-flow net 12 m.", value: "+186 k€", accent: t.teal },
    { label: "PV latente", value: "+4,40 M€", accent: t.teal, sub: "+13,4 %" },
  ];
  const cols = ["Bien", "Entité · quote-part", "Prix de revient", "Valeur actuelle", "Dette", "LTV", "Taux · maturité", "DSCR", "Loyers 12m", "Rdt net", "PV latente", "Conf."];
  return (
    <SynShellA active="Immobilier" eyebrow="Patrimoine immobilier · 5 biens" title="Immobilier" t={t}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 12 }}>
        {kpis.map((k, i) => (
          <SynCard t={t} key={i} pad={14}>
            <SynLabel t={t} size={9} style={{ marginBottom: 8 }}>{k.label}</SynLabel>
            <div style={{ fontSize: 18, fontWeight: 600, color: k.accent || t.text }}>{k.value}</div>
            {k.sub && <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>{k.sub}</div>}
          </SynCard>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12 }}>
        <SynCard t={t}>
          <SynLabel t={t} style={{ marginBottom: 12 }}>Valeur vs dette par bien (M€)</SynLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {RE_PROPS.map((p, i) => {
              const valNum = parseFloat(p.value);
              const max = 13.4;
              const valW = (valNum / max) * 100;
              const debtW = (parseFloat(p.debt) / max) * 100;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: t.textMuted }}>{p.name}</span>
                    <span><span style={{ fontWeight: 600 }}>{p.value}</span> <span style={{ color: t.textFaint }}>· dette {p.debt}</span></span>
                  </div>
                  <div style={{ position: "relative", height: 14, background: t.rowHover, borderRadius: 3 }}>
                    <div style={{ position: "absolute", inset: 0, width: `${valW}%`, background: t.goldDim, border: `1px solid ${t.gold}55`, borderRadius: 3 }}></div>
                    <div style={{ position: "absolute", top: 0, bottom: 0, width: `${debtW}%`, background: t.red, opacity: 0.7, borderRadius: 3 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 10.5, color: t.textMuted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, background: t.goldDim, border: `1px solid ${t.gold}55`, borderRadius: 2 }}></span>Valeur de marché</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, background: t.red, opacity: 0.7, borderRadius: 2 }}></span>Dette restante</span>
          </div>
        </SynCard>
        <SynCard t={t}>
          <SynLabel t={t} style={{ marginBottom: 12 }}>Maturités de dette immobilière (M€)</SynLabel>
          <SynBars t={t} data={[{ y: "2027", v: 4.95 }, { y: "2028", v: 0 }, { y: "2029", v: 7.24 }, { y: "2031", v: 4.2 }, { y: "2033+", v: 1.01 }]} h={92} highlightIdx={0} />
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.borderSoft}`, display: "flex", flexDirection: "column", gap: 7, fontSize: 11 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: t.textMuted }}>Dette à taux fixe</span><span style={{ fontWeight: 600 }}>15,3 M€ · 88 %</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: t.textMuted }}>Dette à taux variable</span><span style={{ fontWeight: 600 }}>2,1 M€ · 12 %</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: t.textMuted }}>Coût moyen pondéré</span><span style={{ fontWeight: 600 }}>2,28 %</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: t.textMuted }}>Crédit relais à refinancer</span><SynBadge t={t} tone="amber">2,1 M€ · 03/2027</SynBadge></div>
          </div>
        </SynCard>
      </div>

      <SynCard t={t} pad={0} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px" }}>
          <SynLabel t={t}>Détail des biens</SynLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {["Filtrer", "Grouper : entité", "⇪ Importer Excel immo"].map((s, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 600, padding: "5px 11px", borderRadius: 6, border: `1px solid ${t.border}`, color: i === 2 ? t.gold : t.textMuted, background: i === 2 ? t.goldDim : "transparent" }}>{s}</span>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, minWidth: 1100 }}>
            <thead>
              <tr style={{ background: t.thBg, borderTop: `1px solid ${t.borderSoft}`, borderBottom: `1px solid ${t.border}` }}>
                {cols.map((c, i) => (
                  <th key={i} style={{ textAlign: i === 0 || i === 1 ? "left" : "right", padding: "9px 14px", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, whiteSpace: "nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RE_PROPS.map((p, i) => (
                <tr key={i} style={{ borderBottom: i < RE_PROPS.length - 1 ? `1px solid ${t.borderSoft}` : "none" }}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: t.textFaint, marginTop: 1 }}>{p.city}</div>
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ color: t.blue }}>{p.entity}</div>
                    <div style={{ fontSize: 10, color: t.textFaint, marginTop: 1 }}>{p.own}</div>
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "right" }}>{p.cost}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>{p.value}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right", color: t.textMuted }}>{p.debt}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right" }}>
                    <SynBadge t={t} tone={p.ltv >= 54 ? "amber" : "neutral"}>{String(p.ltv).replace(".", ",")} %</SynBadge>
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "right", color: t.textMuted, whiteSpace: "nowrap" }}>{p.rate}<div style={{ fontSize: 10, color: t.textFaint }}>{p.mat}</div></td>
                  <td style={{ padding: "11px 14px", textAlign: "right", color: t.textMuted }}>{p.dscr}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right" }}>{p.rent}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right", color: t.textMuted, whiteSpace: "nowrap" }}>{p.yieldNet}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600, color: t.teal }}>{p.pv}</td>
                  <td style={{ padding: "11px 14px", textAlign: "right" }}><REtag t={t} conf={p.conf} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: t.cardAlt, borderTop: `1px solid ${t.border}` }}>
                <td style={{ padding: "11px 14px", fontWeight: 600 }} colSpan={2}>Total · 5 biens</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>33,25 M€</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>38,50 M€</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>17,40 M€</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>45,2 %</td>
                <td colSpan={3}></td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>1,20 M€</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600, color: t.teal }}>+4,40 M€</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </SynCard>
    </SynShellA>
  );
}
window.ViewImmo = ViewImmo;
