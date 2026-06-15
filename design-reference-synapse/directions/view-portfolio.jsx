// Vue Portefeuille titres (panier actions / ETF / obligations) — Direction A
const PF_GROUPS = [
  {
    cls: "Actions cotées", color: "cote", total: "14,80 M€", pv: "+4,10 M€", pvpct: "+38,3 %",
    rows: [
      { name: "NVIDIA Corp", tick: "NVDA", acct: "CTO UBS", date: "14/03/2023", qty: "9 200", px: "452,10 €", cost: "4,16 M€", val: "5,40 M€", pv: "+1,24 M€", pvpct: "+29,8 %", w: "6,4 %", pledged: true },
      { name: "Hermès Intl", tick: "RMS", acct: "PEA J. de Launay", date: "08/01/2020", qty: "1 450", px: "1 612 €", cost: "2,34 M€", val: "3,15 M€", pv: "+0,81 M€", pvpct: "+34,6 %", w: "3,7 %", pledged: false },
      { name: "LVMH", tick: "MC", acct: "CTO BNP", date: "22/09/2021", qty: "2 100", px: "642 €", cost: "1,35 M€", val: "1,52 M€", pv: "+0,17 M€", pvpct: "+12,6 %", w: "1,8 %", pledged: true },
      { name: "ASML Holding", tick: "ASML", acct: "CTO UBS", date: "11/05/2022", qty: "1 320", px: "548 €", cost: "0,72 M€", val: "1,28 M€", pv: "+0,56 M€", pvpct: "+77,8 %", w: "1,5 %", pledged: true },
      { name: "Kering", tick: "KER", acct: "CTO BNP", date: "03/02/2022", qty: "1 800", px: "521 €", cost: "0,94 M€", val: "0,71 M€", pv: "−0,23 M€", pvpct: "−24,5 %", w: "0,8 %", pledged: false },
    ],
  },
  {
    cls: "ETF & fonds indiciels", color: "cote", total: "5,60 M€", pv: "+1,42 M€", pvpct: "+34,0 %",
    rows: [
      { name: "Amundi MSCI World (CW8)", tick: "CW8", acct: "PEA J. de Launay", date: "Plan 2019→2026", qty: "11 400", px: "418 €", cost: "3,52 M€", val: "4,77 M€", pv: "+1,25 M€", pvpct: "+35,5 %", w: "5,7 %", lookthrough: "NVDA 4,8 % · AAPL 4,1 %", pledged: false },
      { name: "iShares Core S&P 500", tick: "CSPX", acct: "CTO UBS", date: "16/06/2021", qty: "1 050", px: "486 €", cost: "0,72 M€", val: "0,83 M€", pv: "+0,11 M€", pvpct: "+15,3 %", w: "1,0 %", lookthrough: "NVDA 6,2 %", pledged: true },
    ],
  },
  {
    cls: "Obligations", color: "priv", total: "2,00 M€", pv: "−0,12 M€", pvpct: "−5,7 %",
    rows: [
      { name: "OAT 2,75 % 2031", tick: "FR0014…", acct: "CTO BNP", date: "05/10/2023", qty: "1 000 000", px: "98,4", cost: "0,98 M€", val: "1,02 M€", pv: "+0,04 M€", pvpct: "+4,1 %", w: "1,2 %", pledged: false },
      { name: "Atos 1,75 % 2027", tick: "FR0013…", acct: "CTO BNP", date: "19/04/2022", qty: "1 200 000", px: "82,1", cost: "1,14 M€", val: "0,96 M€", pv: "−0,18 M€", pvpct: "−15,8 %", w: "1,1 %", pledged: false },
    ],
  },
];

function ViewPortfolio() {
  const t = SYN_DARK;
  const cols = ["Actif", "Compte", "Date d'achat", "Qté", "Prix moyen", "Prix de revient", "Valeur actuelle", "PV latente", "%", "Poids", "Nanti"];
  const kpis = [
    { label: "Valeur de marché", value: "22,40 M€" },
    { label: "Prix de revient", value: "17,00 M€" },
    { label: "PV latente brute", value: "+5,40 M€", accent: t.teal, sub: "+31,8 %" },
    { label: "Revenus 12 mois", value: "0,38 M€", sub: "Dividendes + coupons" },
    { label: "Titres nantis (Lombard)", value: "12,60 M€", sub: "56 % du portefeuille" },
    { label: "TRI brut", value: "12,4 %", accent: t.teal },
  ];
  return (
    <SynShellA active="Portefeuille" eyebrow="Portefeuille financier · 3 comptes-titres + PEA" title="Portefeuille titres" t={t}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
        {kpis.map((k, i) => (
          <SynCard t={t} key={i} pad={14}>
            <SynLabel t={t} size={9} style={{ marginBottom: 8 }}>{k.label}</SynLabel>
            <div style={{ fontSize: 18, fontWeight: 600, color: k.accent || t.text }}>{k.value}</div>
            {k.sub && <div style={{ fontSize: 10, color: t.textMuted, marginTop: 4 }}>{k.sub}</div>}
          </SynCard>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.card, border: `1px solid ${t.border}`, borderRadius: 7, padding: "8px 12px", flex: 1, maxWidth: 320, color: t.textFaint, fontSize: 12 }}>
          <span>⌕</span> Rechercher un titre, ISIN, ticker…
        </div>
        {["Grouper : classe d'actif", "Trier : PV latente", "Filtrer", "Colonnes"].map((s, i) => (
          <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "7px 12px", borderRadius: 7, border: `1px solid ${t.border}`, color: i === 0 ? t.gold : t.textMuted, background: i === 0 ? t.goldDim : "transparent" }}>{s}</span>
        ))}
        <div style={{ flex: 1 }}></div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "7px 12px", borderRadius: 7, border: `1px solid ${t.border}`, color: t.textMuted }}>⇩ CSV · Excel</span>
      </div>

      <SynCard t={t} pad={0} style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, minWidth: 1080 }}>
            <thead>
              <tr style={{ background: t.thBg, borderBottom: `1px solid ${t.border}` }}>
                {cols.map((c, i) => (
                  <th key={i} style={{ textAlign: i === 0 || i === 1 ? "left" : i === 10 ? "center" : "right", padding: "10px 14px", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted, whiteSpace: "nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PF_GROUPS.map((g, gi) => (
                <React.Fragment key={gi}>
                  <tr style={{ background: t.cardAlt }}>
                    <td colSpan={6} style={{ padding: "8px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: SYN_ALLOC_COLORS.dark[g.color] }}></span>
                        <span style={{ fontWeight: 600, fontSize: 11.5 }}>{g.cls}</span>
                        <span style={{ color: t.textFaint, fontSize: 10.5 }}>· {g.rows.length} lignes</span>
                      </span>
                    </td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 600 }}>{g.total}</td>
                    <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 600, color: g.pv.startsWith("−") ? t.red : t.teal }}>{g.pv}</td>
                    <td style={{ padding: "8px 14px", textAlign: "right", color: g.pv.startsWith("−") ? t.red : t.teal, fontSize: 10.5 }}>{g.pvpct}</td>
                    <td colSpan={2}></td>
                  </tr>
                  {g.rows.map((r, ri) => (
                    <tr key={ri} style={{ borderBottom: `1px solid ${t.borderSoft}` }}>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{r.name}</span>
                          <span style={{ fontSize: 9.5, color: t.textFaint, border: `1px solid ${t.border}`, borderRadius: 3, padding: "1px 5px" }}>{r.tick}</span>
                        </div>
                        {r.lookthrough && <div style={{ fontSize: 10, color: t.blue, marginTop: 2 }}>↳ look-through : {r.lookthrough}</div>}
                      </td>
                      <td style={{ padding: "10px 14px", color: t.textMuted }}>{r.acct}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: t.textMuted, whiteSpace: "nowrap" }}>{r.date}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: t.textMuted }}>{r.qty}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: t.textMuted }}>{r.px}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: t.textMuted }}>{r.cost}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600 }}>{r.val}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, color: r.pv.startsWith("−") ? t.red : t.teal }}>{r.pv}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: r.pv.startsWith("−") ? t.red : t.teal, fontSize: 10.5 }}>{r.pvpct}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: t.textMuted }}>{r.w}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>{r.pledged ? <SynBadge t={t} tone="blue">Nanti</SynBadge> : <span style={{ color: t.textFaint }}>—</span>}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: t.cardAlt, borderTop: `1px solid ${t.border}` }}>
                <td style={{ padding: "11px 14px", fontWeight: 600 }} colSpan={5}>Total portefeuille titres · 9 lignes</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>17,00 M€</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>22,40 M€</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600, color: t.teal }}>+5,40 M€</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600, color: t.teal }}>+31,8 %</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </SynCard>

      <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11, color: t.textMuted }}>
        <SynBadge t={t} tone="blue">Look-through actif</SynBadge>
        <span>Exposition indirecte NVIDIA via ETF estimée à <span style={{ color: t.text, fontWeight: 600 }}>0,28 M€</span> — voir Analyse d'exposition.</span>
      </div>
    </SynShellA>
  );
}
window.ViewPortfolio = ViewPortfolio;
