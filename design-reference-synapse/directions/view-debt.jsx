// Vue Dette & Levier + module Lombard — Direction A
const DEBT_ROWS = [
  { name: "Le Castellane — in fine", borrower: "Financière du Louvre", lender: "Crédit Agricole", type: "Immo in fine", rate: "2,10 % fixe", crd: "7,24 M€", init: "7,24 M€", mat: "06/2029", amort: "In fine", ltv: "54,0 % / 55 %", ltvTone: "amber", coll: "Hypothèque 1er rang", st: "Watch", stTone: "amber" },
  { name: "18 r. Fbg Montmartre", borrower: "SAS Palace", lender: "BNP Paribas", type: "Immo amortissable", rate: "1,85 % fixe", crd: "4,20 M€", init: "5,60 M€", mat: "09/2031", amort: "Amortissable", ltv: "47,2 %", ltvTone: "neutral", coll: "Hypothèque", st: "Healthy", stTone: "teal" },
  { name: "Ligne Lombard", borrower: "Famille de Launay", lender: "UBS", type: "Lombard", rate: "€STR + 0,85 %", crd: "5,20 M€", init: "8,00 M€ aut.", mat: "07/2027 rev.", amort: "In fine", ltv: "41,2 % / 60 %", ltvTone: "teal", coll: "Nantissement titres", st: "Healthy", stTone: "teal" },
  { name: "Crédit corporate", borrower: "FDL Invest", lender: "BNP Paribas", type: "Corporate", rate: "4,10 % fixe", crd: "3,00 M€", init: "4,00 M€", mat: "11/2028", amort: "Amortissable", ltv: "ICR 4,2× / min 2×", ltvTone: "neutral", coll: "Nantissement de parts", st: "Healthy", stTone: "teal" },
  { name: "Résidence Vauban", borrower: "SCI Rivoli", lender: "Société Générale", type: "Immo amortissable", rate: "3,40 % fixe", crd: "2,85 M€", init: "3,40 M€", mat: "03/2027", amort: "Amortissable", ltv: "55,9 %", ltvTone: "neutral", coll: "Hypothèque", st: "Healthy", stTone: "teal" },
  { name: "Crédit travaux Le Castellane", borrower: "Financière du Louvre", lender: "Crédit Agricole", type: "Travaux", rate: "2,65 % fixe", crd: "2,20 M€", init: "2,50 M€", mat: "06/2030", amort: "Amortissable", ltv: "—", ltvTone: "neutral", coll: "Hypothèque 2e rang", st: "Healthy", stTone: "teal" },
  { name: "Crédit relais Plateau Haussmann", borrower: "Patrimoine de Rivoli", lender: "BNP Paribas", type: "Relais", rate: "E3M + 1,10 %", crd: "2,10 M€", init: "2,10 M€", mat: "03/2027", amort: "In fine", ltv: "26,9 %", ltvTone: "neutral", coll: "Hypothèque + GP", st: "Refi à planifier", stTone: "blue" },
  { name: "Villa Méridienne", borrower: "Famille de Launay", lender: "CIC", type: "Immo amortissable", rate: "1,95 % fixe", crd: "1,01 M€", init: "1,60 M€", mat: "01/2033", amort: "Amortissable", ltv: "30,6 %", ltvTone: "neutral", coll: "Hypothèque", st: "Healthy", stTone: "teal" },
];

function ViewDebt() {
  const t = SYN_DARK;
  const kpis = [
    { label: "Dette totale", value: "27,80 M€", sub: "LTV global 33,0 %" },
    { label: "Coût moyen pondéré", value: "3,42 %", sub: "Intérêts 12 m. : 948 k€" },
    { label: "Taux fixe / variable", value: "74 % / 26 %", sub: "Variable : relais + Lombard" },
    { label: "Maturité moyenne", value: "4,8 ans" },
    { label: "Collatéral mobilisé", value: "42,5 M€", sub: "Actifs non grevés : 41,7 M€" },
    { label: "Échéances 24 mois", value: "6,40 M€", accent: t.amber, sub: "dont relais 2,1 M€ · 03/2027" },
  ];
  const banks = [
    { l: "Crédit Agricole", v: "9,44 M€", w: 100 },
    { l: "BNP Paribas", v: "9,30 M€", w: 98.5 },
    { l: "UBS", v: "5,20 M€", w: 55.1 },
    { l: "Société Générale", v: "2,85 M€", w: 30.2 },
    { l: "CIC", v: "1,01 M€", w: 10.7 },
  ];
  const stress = [
    { s: "Base", ltv: "41,2 %", marge: "18,8 pts", cash: "—", tone: "teal" },
    { s: "−10 %", ltv: "45,8 %", marge: "14,2 pts", cash: "—", tone: "teal" },
    { s: "−20 %", ltv: "51,5 %", marge: "8,5 pts", cash: "—", tone: "teal" },
    { s: "−30 %", ltv: "58,9 %", marge: "1,1 pt", cash: "—", tone: "amber" },
    { s: "−35 %", ltv: "63,4 %", marge: "breach", cash: "0,29 M€", tone: "red" },
  ];
  const cols = ["Crédit", "Emprunteur", "Prêteur", "Type", "Taux", "CRD / initial", "Échéance", "LTV · covenant", "Collatéral", "Statut"];
  return (
    <SynShellA active="Dette & Levier" eyebrow="8 lignes de crédit · 5 banques · 3 UBO" title="Dette & Levier" t={t}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {kpis.map((k, i) => (
          <SynCard t={t} key={i} pad={14}>
            <SynLabel t={t} size={9} style={{ marginBottom: 8 }}>{k.label}</SynLabel>
            <div style={{ fontSize: 18, fontWeight: 600, color: k.accent || t.text }}>{k.value}</div>
            {k.sub && <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>{k.sub}</div>}
          </SynCard>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr", gap: 12 }}>
        {/* Module Lombard */}
        <SynCard t={t} style={{ borderLeft: `2px solid ${t.blue}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <SynLabel t={t}>Crédit Lombard — UBS</SynLabel>
            <SynBadge t={t} tone="teal">Healthy</SynBadge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
            {[["Tiré / autorisé", "5,2 / 8,0 M€"], ["Portefeuille nanti", "14,9 M€"], ["Base éligible*", "12,6 M€"]].map((m, i) => (
              <div key={i}>
                <SynLabel t={t} size={8.5} style={{ marginBottom: 4 }}>{m[0]}</SynLabel>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{m[1]}</div>
              </div>
            ))}
          </div>
          <div style={{ position: "relative", height: 10, borderRadius: 5, background: t.rowHover }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: "41.2%", height: "100%", background: t.teal }}></div>
            </div>
            <div style={{ position: "absolute", left: "60%", top: -4, bottom: -4, width: 2, background: t.amber }}></div>
            <div style={{ position: "absolute", left: "68%", top: -4, bottom: -4, width: 2, background: t.red }}></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 10 }}>
            <span style={{ color: t.teal, fontWeight: 600 }}>LTV 41,2 %</span>
            <span style={{ color: t.amber }}>Max 60 %</span>
            <span style={{ color: t.red }}>Appel de marge 68 %</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginTop: 14 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                {["Scénario", "LTV stressé", "Marge", "Cash requis"].map((c, i) => (
                  <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "6px 4px", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stress.map((r, i) => (
                <tr key={i} style={{ borderBottom: i < stress.length - 1 ? `1px solid ${t.borderSoft}` : "none" }}>
                  <td style={{ padding: "6px 4px", color: t.textMuted }}>{r.s}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 600, color: r.tone === "red" ? t.red : r.tone === "amber" ? t.amber : t.text }}>{r.ltv}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right", color: r.tone === "red" ? t.red : r.tone === "amber" ? t.amber : t.textMuted }}>{r.marge}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right", color: r.cash === "—" ? t.textFaint : t.red, fontWeight: r.cash === "—" ? 400 : 600 }}>{r.cash}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 9.5, color: t.textFaint, marginTop: 10 }}>* après haircuts (moy. 15 %) · concentration max : NVDA 26 % de la base</div>
        </SynCard>

        {/* Dette par banque */}
        <SynCard t={t}>
          <SynLabel t={t} style={{ marginBottom: 14 }}>Dette par banque</SynLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {banks.map((b, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 4 }}>
                  <span style={{ color: t.textMuted }}>{b.l}</span>
                  <span style={{ fontWeight: 600 }}>{b.v}</span>
                </div>
                <div style={{ height: 6, background: t.rowHover, borderRadius: 3 }}>
                  <div style={{ width: `${b.w}%`, height: "100%", background: t.gold, borderRadius: 3, opacity: 0.85 }}></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.borderSoft}`, fontSize: 11, color: t.textMuted, display: "flex", justifyContent: "space-between" }}>
            <span>Concentration 1ʳᵉ banque</span><span style={{ fontWeight: 600, color: t.text }}>34,0 %</span>
          </div>
        </SynCard>

        {/* Maturités + covenants */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SynCard t={t}>
            <SynLabel t={t} style={{ marginBottom: 10 }}>Maturités (M€)</SynLabel>
            <SynBars t={t} data={FDL.maturitySeries} h={70} highlightIdx={1} />
          </SynCard>
          <SynCard t={t} style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <SynLabel t={t}>Covenants</SynLabel>
              <SynBadge t={t} tone="amber">1 watch</SynBadge>
            </div>
            {[
              { n: "LTV — Le Castellane", v: "54,0 / 55 %", tone: "amber" },
              { n: "LTV — Lombard UBS", v: "41,2 / 60 %", tone: "teal" },
              { n: "ICR — Corporate FDL Invest", v: "4,2× / min 2×", tone: "teal" },
              { n: "DSCR — SAS Palace", v: "3,64× / min 1,2×", tone: "teal" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 3 ? `1px solid ${t.borderSoft}` : "none", fontSize: 11 }}>
                <span style={{ flex: 1, fontWeight: 600 }}>{c.n}</span>
                <span style={{ color: c.tone === "amber" ? t.amber : t.textMuted, fontSize: 10.5 }}>{c.v}</span>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.tone === "amber" ? t.amber : t.teal }}></span>
              </div>
            ))}
          </SynCard>
        </div>
      </div>

      {/* Table des dettes */}
      <SynCard t={t} pad={0} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px" }}>
          <SynLabel t={t}>Lignes de crédit</SynLabel>
          <div style={{ display: "flex", gap: 8 }}>
            {["Grouper : type", "Trier : maturité", "⇪ Importer échéancier"].map((s, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 600, padding: "5px 11px", borderRadius: 6, border: `1px solid ${t.border}`, color: i === 2 ? t.gold : t.textMuted, background: i === 2 ? t.goldDim : "transparent" }}>{s}</span>
            ))}
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <thead>
            <tr style={{ background: t.thBg, borderTop: `1px solid ${t.borderSoft}`, borderBottom: `1px solid ${t.border}` }}>
              {cols.map((c, i) => (
                <th key={i} style={{ textAlign: i <= 3 ? "left" : i >= 8 ? "left" : "right", padding: "9px 14px", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, whiteSpace: "nowrap" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEBT_ROWS.map((d, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${t.borderSoft}` }}>
                <td style={{ padding: "10px 14px", fontWeight: 600 }}>{d.name}</td>
                <td style={{ padding: "10px 14px", color: t.blue }}>{d.borrower}</td>
                <td style={{ padding: "10px 14px", color: t.textMuted }}>{d.lender}</td>
                <td style={{ padding: "10px 14px", color: t.textMuted }}>{d.type}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: t.textMuted, whiteSpace: "nowrap" }}>{d.rate}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", whiteSpace: "nowrap" }}><span style={{ fontWeight: 600 }}>{d.crd}</span><span style={{ color: t.textFaint, fontSize: 10 }}> / {d.init}</span></td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: t.textMuted }}>{d.mat}</td>
                <td style={{ padding: "10px 14px", textAlign: "right" }}><SynBadge t={t} tone={d.ltvTone}>{d.ltv}</SynBadge></td>
                <td style={{ padding: "10px 14px", color: t.textMuted }}>{d.coll}</td>
                <td style={{ padding: "10px 14px" }}><SynBadge t={t} tone={d.stTone}>{d.st}</SynBadge></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: t.cardAlt, borderTop: `1px solid ${t.border}` }}>
              <td style={{ padding: "11px 14px", fontWeight: 600 }} colSpan={5}>Total · 8 lignes</td>
              <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>27,80 M€</td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </SynCard>
    </SynShellA>
  );
}
window.ViewDebt = ViewDebt;
