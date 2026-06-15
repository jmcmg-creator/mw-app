// Fiche actif détaillée — drawer NVIDIA ouvert au-dessus du portefeuille
function ViewAssetDrawer() {
  const t = SYN_DARK;
  const lots = [
    { d: "14/03/2023", q: "5 000", pu: "352,40 €", fees: "1 840 €", cost: "1,76 M€", val: "2,93 M€", pv: "+1,17 M€", conf: "teal", confL: "Haute" },
    { d: "02/11/2023", q: "2 700", pu: "418,10 €", fees: "1 120 €", cost: "1,13 M€", val: "1,58 M€", pv: "+0,45 M€", conf: "teal", confL: "Haute" },
    { d: "21/05/2024", q: "1 500", pu: "846,70 €", fees: "990 €", cost: "1,27 M€", val: "0,89 M€", pv: "−0,38 M€", conf: "amber", confL: "Moyenne" },
  ];
  const timeline = [
    { d: "12/06/2026", e: "Valorisation mise à jour — cours UBS", ic: "◎", tone: t.textMuted },
    { d: "03/04/2026", e: "Nantissement étendu — ligne Lombard UBS", ic: "◍", tone: t.blue },
    { d: "15/01/2026", e: "Dividende encaissé — 3 312 €", ic: "↧", tone: t.teal },
    { d: "21/05/2024", e: "Achat complémentaire — 1 500 titres", ic: "＋", tone: t.text },
    { d: "02/11/2023", e: "Achat complémentaire — 2 700 titres", ic: "＋", tone: t.text },
    { d: "14/03/2023", e: "Achat initial — 5 000 titres (avis d'opéré joint)", ic: "＋", tone: t.text },
  ];
  const docs = [
    { n: "Avis d'opéré — achat 14/03/2023", type: "purchase_agreement" },
    { n: "Contrat de nantissement UBS", type: "pledge_agreement" },
    { n: "Relevé CTO UBS — juin 2026", type: "bank_statement" },
  ];
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <ViewPortfolio />
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,6,10,0.62)" }}></div>
      {/* Drawer */}
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 620, background: t.card, borderLeft: `1px solid ${t.border}`, fontFamily: SYN_FONT, color: t.text, fontVariantNumeric: "tabular-nums", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${t.borderSoft}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 600 }}>NVIDIA Corp</span>
                <span style={{ fontSize: 10, color: t.textFaint, border: `1px solid ${t.border}`, borderRadius: 3, padding: "1px 6px" }}>NVDA · US67066G1040</span>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
                <SynBadge t={t} tone="neutral">Action cotée</SynBadge>
                <SynBadge t={t} tone="neutral">CTO UBS</SynBadge>
                <SynBadge t={t} tone="neutral">UBO : Famille de Launay</SynBadge>
                <SynBadge t={t} tone="blue">Nanti — Lombard UBS</SynBadge>
              </div>
            </div>
            <span style={{ color: t.textFaint, fontSize: 18, lineHeight: 1 }}>✕</span>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Résumé */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              ["Valeur actuelle", "5,40 M€", t.text], ["Prix de revient", "4,16 M€", t.textMuted],
              ["PV latente", "+1,24 M€", t.teal], ["PV %", "+29,8 %", t.teal],
              ["Quantité", "9 200", t.text], ["TRI", "+24,6 %", t.teal],
              ["Poids du patrimoine", "6,4 %", t.text], ["Dividendes 12 m.", "3 312 €", t.text],
            ].map((k, i) => (
              <div key={i} style={{ background: t.cardAlt, border: `1px solid ${t.borderSoft}`, borderRadius: 8, padding: "10px 12px" }}>
                <SynLabel t={t} size={8.5} style={{ marginBottom: 5 }}>{k[0]}</SynLabel>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: k[2] }}>{k[1]}</div>
              </div>
            ))}
          </div>
          {/* Lots */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <SynLabel t={t}>Lots d'achat — PMP 452,10 € · méthode FIFO disponible</SynLabel>
              <span style={{ fontSize: 10.5, color: t.blue, fontWeight: 600 }}>Acquisition Ledger →</span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  {["Date", "Qté", "PU", "Frais", "Coût", "Valeur", "PV", "Conf."].map((c, i) => (
                    <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "6px 6px", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lots.map((l, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${t.borderSoft}` }}>
                    <td style={{ padding: "7px 6px", whiteSpace: "nowrap" }}>{l.d}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right", color: t.textMuted }}>{l.q}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right", color: t.textMuted }}>{l.pu}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right", color: t.textFaint }}>{l.fees}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right" }}>{l.cost}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right", fontWeight: 600 }}>{l.val}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right", fontWeight: 600, color: l.pv.startsWith("−") ? t.red : t.teal }}>{l.pv}</td>
                    <td style={{ padding: "7px 6px", textAlign: "right" }}><SynBadge t={t} tone={l.conf}>{l.confL}</SynBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Nantissement + fiscalité côte à côte */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: t.cardAlt, border: `1px solid ${t.borderSoft}`, borderLeft: `2px solid ${t.blue}`, borderRadius: 8, padding: 14 }}>
              <SynLabel t={t} size={9} style={{ marginBottom: 10 }}>Nantissement — Lombard UBS</SynLabel>
              {[["Valeur nantie", "5,40 M€"], ["Haircut", "25 %"], ["Valeur éligible", "4,05 M€"], ["Part de la base éligible", "26 %"]].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 3 ? `1px solid ${t.borderSoft}` : "none", fontSize: 11 }}>
                  <span style={{ color: t.textMuted }}>{r[0]}</span><span style={{ fontWeight: 600 }}>{r[1]}</span>
                </div>
              ))}
              <div style={{ marginTop: 9, fontSize: 10, color: t.amber }}>⚠ Concentration élevée dans la base de collatéral</div>
            </div>
            <div style={{ background: t.cardAlt, border: `1px solid ${t.borderSoft}`, borderRadius: 8, padding: 14 }}>
              <SynLabel t={t} size={9} style={{ marginBottom: 10 }}>Fiscalité indicative</SynLabel>
              {[["Régime présumé", "PFU 30 %"], ["PV taxable estimée", "1,24 M€"], ["Impôt latent indicatif", "≈ 372 k€"], ["PV nette indicative", "≈ +0,87 M€"]].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 3 ? `1px solid ${t.borderSoft}` : "none", fontSize: 11 }}>
                  <span style={{ color: t.textMuted }}>{r[0]}</span><span style={{ fontWeight: 600 }}>{r[1]}</span>
                </div>
              ))}
              <div style={{ marginTop: 9, fontSize: 9.5, color: t.textFaint, fontStyle: "italic" }}>Estimation indicative. À valider par conseil fiscal.</div>
            </div>
          </div>
          {/* Timeline + documents */}
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 12, flex: 1, minHeight: 0 }}>
            <div>
              <SynLabel t={t} style={{ marginBottom: 10 }}>Timeline d'investissement</SynLabel>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {timeline.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "5px 0" }}>
                    <span style={{ width: 18, textAlign: "center", color: e.tone, fontSize: 12 }}>{e.ic}</span>
                    <span style={{ fontSize: 10, color: t.textFaint, width: 64, flexShrink: 0, paddingTop: 1 }}>{e.d}</span>
                    <span style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.4 }}>{e.e}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SynLabel t={t} style={{ marginBottom: 10 }}>Documents (3)</SynLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {docs.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, background: t.cardAlt, border: `1px solid ${t.borderSoft}`, borderRadius: 7, padding: "8px 11px" }}>
                    <span style={{ color: t.gold, fontSize: 13 }}>▤</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, flex: 1, lineHeight: 1.35 }}>{d.n}</span>
                    <span style={{ color: t.textFaint, fontSize: 11 }}>⇩</span>
                  </div>
                ))}
                <div style={{ border: `1px dashed ${t.border}`, borderRadius: 7, padding: "8px 11px", fontSize: 10.5, color: t.textFaint, textAlign: "center" }}>+ Rattacher un document</div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer actions */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${t.borderSoft}`, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "8px 14px", borderRadius: 7, border: `1px solid ${t.border}`, color: t.textMuted }}>Audit trail</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "8px 14px", borderRadius: 7, border: `1px solid ${t.gold}66`, color: t.gold }}>Voir l'exposition NVDA</span>
        </div>
      </div>
    </div>
  );
}
window.ViewAssetDrawer = ViewAssetDrawer;
