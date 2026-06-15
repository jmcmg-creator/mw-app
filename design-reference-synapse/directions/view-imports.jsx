// Vue Imports & réconciliation — Direction A
function ViewImports() {
  const t = SYN_DARK;
  const steps = ["Upload", "Mapping", "Validation", "Réconciliation", "Import"];
  const recon = [
    { l: "Valeur de marché", imp: "12 642 380 €", calc: "12 624 510 €", ecart: "+17 870 €", tone: "amber", st: "Écart 0,14 %" },
    { l: "Prix de revient", imp: "9 384 200 €", calc: "9 384 200 €", ecart: "0 €", tone: "teal", st: "OK" },
    { l: "PV latente", imp: "+3 258 180 €", calc: "+3 240 310 €", ecart: "+17 870 €", tone: "amber", st: "Écart lié au cours" },
    { l: "Collatéral nanti (Lombard)", imp: "12 600 000 €", calc: "12 600 000 €", ecart: "0 €", tone: "teal", st: "OK" },
    { l: "Cash", imp: "412 060 €", calc: "412 060 €", ecart: "0 €", tone: "teal", st: "OK" },
  ];
  const issues = [
    { sev: "red", asset: "Obligation privée Helios 2028", pb: "ISIN manquant", action: "Saisir l'ISIN ou rattacher manuellement" },
    { sev: "red", asset: "Ligne « UBS Structured Note »", pb: "Prix de revient absent", action: "Compléter le lot d'achat" },
    { sev: "amber", asset: "ASML Holding", pb: "Date d'achat manquante (3 lots)", action: "Récupérer les avis d'opéré" },
    { sev: "amber", asset: "iShares Core S&P 500", pb: "Doublon probable avec CTO UBS existant", action: "Fusionner ou ignorer la ligne" },
    { sev: "amber", asset: "2 lignes", pb: "UBO non rattaché", action: "Affecter à Famille de Launay ou FDL Invest" },
  ];
  const history = [
    { f: "UBS_releve_juin2026.xlsx", type: "Portefeuille titres", d: "12/06/2026", rows: "42 lignes", st: "Réconciliation", tone: "amber" },
    { f: "BNP_immobilier_T2.xlsx", type: "Immobilier", d: "28/05/2026", rows: "5 biens", st: "Importé", tone: "teal" },
    { f: "CA_echeancier_dettes.xlsx", type: "Échéancier de dette", d: "28/05/2026", rows: "6 crédits", st: "Importé", tone: "teal" },
    { f: "UBS_collateral_mai.pdf", type: "Relevé de collatéral", d: "12/05/2026", rows: "18 lignes", st: "Annulé (rollback)", tone: "red" },
  ];
  return (
    <SynShellA active="Imports" eyebrow="Import en cours : UBS_releve_juin2026.xlsx" title="Imports & réconciliation" t={t}>
      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, background: i < 3 ? t.tealDim : i === 3 ? t.goldDim : "transparent", color: i < 3 ? t.teal : i === 3 ? t.gold : t.textFaint, border: `1px solid ${i < 3 ? t.teal + "55" : i === 3 ? t.gold : t.border}` }}>{i < 3 ? "✓" : i + 1}</div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: i === 3 ? t.gold : i < 3 ? t.text : t.textFaint }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: i < 3 ? t.teal + "44" : t.border, margin: "0 12px", maxWidth: 80 }}></div>}
          </React.Fragment>
        ))}
        <div style={{ flex: 1 }}></div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "8px 16px", borderRadius: 7, border: `1px solid ${t.red}55`, color: t.red }}>Rollback</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "8px 16px", borderRadius: 7, background: t.gold, color: t.page }}>Confirmer l'import (38/42)</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 12 }}>
        {/* Résumé du batch */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SynCard t={t}>
            <SynLabel t={t} style={{ marginBottom: 12 }}>Fichier</SynLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 7, background: t.tealDim, color: t.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>▤</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>UBS_releve_juin2026.xlsx</div>
                <div style={{ fontSize: 10, color: t.textFaint }}>Déposé le 12/06/2026 · 9 h 41</div>
              </div>
            </div>
            {[["Type détecté", "Portefeuille titres"], ["Banque", "UBS"], ["Compte", "CH92 ··· 4417 (CTO)"], ["UBO proposé", "Famille de Launay"], ["Devise", "EUR (38) · USD (4)"], ["Colonnes mappées", "14 / 16"]].map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 5 ? `1px solid ${t.borderSoft}` : "none", fontSize: 11 }}>
                <span style={{ color: t.textMuted }}>{r[0]}</span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>{r[1]}</span>
              </div>
            ))}
          </SynCard>
          <SynCard t={t}>
            <SynLabel t={t} style={{ marginBottom: 10 }}>Lignes</SynLabel>
            <div style={{ display: "flex", gap: 14 }}>
              {[["42", "lues", t.text], ["38", "valides", t.teal], ["4", "à corriger", t.amber]].map((c, i) => (
                <div key={i}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: c[2] }}>{c[0]}</div>
                  <div style={{ fontSize: 10, color: t.textFaint }}>{c[1]}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", marginTop: 12 }}>
              <div style={{ width: "90.5%", background: t.teal }}></div>
              <div style={{ width: "9.5%", background: t.amber }}></div>
            </div>
          </SynCard>
        </div>

        {/* Réconciliation + anomalies */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SynCard t={t} pad={0} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px" }}>
              <SynLabel t={t}>Réconciliation — importé vs recalculé</SynLabel>
              <SynBadge t={t} tone="amber">2 écarts</SynBadge>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: t.thBg, borderTop: `1px solid ${t.borderSoft}`, borderBottom: `1px solid ${t.border}` }}>
                  {["Agrégat", "Importé (UBS)", "Recalculé (Synapse)", "Écart", "Statut"].map((c, i) => (
                    <th key={i} style={{ textAlign: i === 0 ? "left" : "right", padding: "9px 18px", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textMuted }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recon.map((r, i) => (
                  <tr key={i} style={{ borderBottom: i < recon.length - 1 ? `1px solid ${t.borderSoft}` : "none" }}>
                    <td style={{ padding: "10px 18px", fontWeight: 600 }}>{r.l}</td>
                    <td style={{ padding: "10px 18px", textAlign: "right", color: t.textMuted }}>{r.imp}</td>
                    <td style={{ padding: "10px 18px", textAlign: "right", color: t.textMuted }}>{r.calc}</td>
                    <td style={{ padding: "10px 18px", textAlign: "right", fontWeight: 600, color: r.tone === "amber" ? t.amber : t.textFaint }}>{r.ecart}</td>
                    <td style={{ padding: "10px 18px", textAlign: "right" }}><SynBadge t={t} tone={r.tone}>{r.st}</SynBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SynCard>

          <SynCard t={t} pad={0} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px" }}>
              <SynLabel t={t}>Lignes à corriger avant import</SynLabel>
              <SynBadge t={t} tone="red">2 critiques</SynBadge>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
              <tbody>
                {issues.map((r, i) => (
                  <tr key={i} style={{ borderBottom: i < issues.length - 1 ? `1px solid ${t.borderSoft}` : "none" }}>
                    <td style={{ padding: "9px 18px", width: 16 }}><span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: r.sev === "red" ? t.red : t.amber }}></span></td>
                    <td style={{ padding: "9px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>{r.asset}</td>
                    <td style={{ padding: "9px 8px", color: r.sev === "red" ? t.red : t.amber }}>{r.pb}</td>
                    <td style={{ padding: "9px 8px", color: t.textMuted }}>{r.action}</td>
                    <td style={{ padding: "9px 18px", textAlign: "right" }}><span style={{ fontSize: 10.5, fontWeight: 600, color: t.blue }}>Corriger →</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SynCard>
        </div>
      </div>

      {/* Historique */}
      <SynCard t={t} pad={0} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px" }}>
          <SynLabel t={t}>Historique des imports</SynLabel>
          <span style={{ fontSize: 10.5, fontWeight: 600, padding: "5px 11px", borderRadius: 6, border: `1px solid ${t.gold}66`, color: t.gold }}>⇪ Nouvel import</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} style={{ borderBottom: i < history.length - 1 ? `1px solid ${t.borderSoft}` : "none" }}>
                <td style={{ padding: "10px 18px", fontWeight: 600 }}>{h.f}</td>
                <td style={{ padding: "10px 8px", color: t.textMuted }}>{h.type}</td>
                <td style={{ padding: "10px 8px", color: t.textMuted }}>{h.d}</td>
                <td style={{ padding: "10px 8px", color: t.textFaint }}>{h.rows}</td>
                <td style={{ padding: "10px 8px" }}><SynBadge t={t} tone={h.tone}>{h.st}</SynBadge></td>
                <td style={{ padding: "10px 18px", textAlign: "right", color: t.blue, fontSize: 10.5, fontWeight: 600 }}>{h.tone === "teal" ? "Rollback" : "Détail"} →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SynCard>
    </SynShellA>
  );
}
window.ViewImports = ViewImports;
