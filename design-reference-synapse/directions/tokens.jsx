// Tokens visuels Synapse + données mock + atomes partagés
// Exportés sur window pour les autres fichiers babel.

const SYN_DARK = {
  name: "dark",
  page: "#0B0F16",
  sidebar: "#070A10",
  card: "#10151F",
  cardAlt: "#0D121A",
  border: "#1D2533",
  borderSoft: "#161D29",
  text: "#E9EDF4",
  textMuted: "#8B95A7",
  textFaint: "#5C6678",
  gold: "#C9A45C",
  goldBright: "#DDBA74",
  teal: "#3FD6A4",
  tealDim: "rgba(63,214,164,.12)",
  blue: "#5BA3EA",
  red: "#E8696B",
  redDim: "rgba(232,105,107,.12)",
  amber: "#D9A441",
  amberDim: "rgba(217,164,65,.12)",
  blueDim: "rgba(91,163,234,.12)",
  goldDim: "rgba(201,164,92,.12)",
  rowHover: "#131927",
  thBg: "#0E131C",
};

const SYN_LIGHT = {
  name: "light",
  page: "#F6F7F9",
  sidebar: "#FFFFFF",
  card: "#FFFFFF",
  cardAlt: "#FAFBFC",
  border: "#E4E7EC",
  borderSoft: "#EDF0F4",
  text: "#15202F",
  textMuted: "#5F6B7E",
  textFaint: "#98A2B3",
  gold: "#A37E33",
  goldBright: "#8A6A28",
  teal: "#0E9A72",
  tealDim: "rgba(14,154,114,.09)",
  blue: "#2873C4",
  red: "#C7484B",
  redDim: "rgba(199,72,75,.08)",
  amber: "#B07F1F",
  amberDim: "rgba(176,127,31,.10)",
  blueDim: "rgba(40,115,196,.08)",
  goldDim: "rgba(163,126,51,.10)",
  rowHover: "#F3F5F8",
  thBg: "#F2F4F7",
};

const SYN_FONT = "'IBM Plex Sans', sans-serif";
const SYN_SERIF = "'Cormorant Garamond', serif";

// ---------- Données mock : Famille de Launay / Groupe FDL ----------
const FDL = {
  client: "Groupe FDL",
  ubo: "Famille de Launay",
  date: "11 juin 2026",
  netWorth: "56,4 M€",
  grossAssets: "84,2 M€",
  totalDebt: "27,8 M€",
  cash: "3,4 M€",
  undrawn: "2,8 M€",
  unrealizedGains: "+19,8 M€",
  unrealizedPct: "+30,7 %",
  unrealizedNetDebt: "+16,2 M€",
  ltv: "33,0 %",
  wacd: "3,42 %",
  irr: "9,4 %",
  irrLevered: "11,8 %",
  ytd: "+6,2 %",
  perf1y: "+11,4 %",
  incomes12m: "2,31 M€",
  interests12m: "948 k€",
  debtRE: "19,6 M€",
  debtLombard: "5,2 M€",
  debtCorp: "3,0 M€",
  lombardDrawn: "5,2 M€",
  lombardLine: "8,0 M€",
  lombardLTV: "41,2 %",
  lombardMax: "60 %",
  lombardMargin: "18,8 pts",
  mat12: "2,1 M€",
  mat24: "6,4 M€",
  mat36: "9,8 M€",
  allocation: [
    { label: "Immobilier", value: "38,5 M€", pct: 45.7, key: "immo" },
    { label: "Coté (titres & ETF)", value: "22,4 M€", pct: 26.6, key: "cote" },
    { label: "Private equity & fonds", value: "11,8 M€", pct: 14.0, key: "pe" },
    { label: "Participations privées", value: "6,9 M€", pct: 8.2, key: "priv" },
    { label: "Cash", value: "3,4 M€", pct: 4.0, key: "cash" },
    { label: "Assurance-vie", value: "1,2 M€", pct: 1.4, key: "av" },
  ],
  topContrib: [
    { name: "NVIDIA Corp", entity: "FDL Invest", amount: "+1,24 M€", pct: "+38,2 %" },
    { name: "ETF S&P 500 (CW8)", entity: "PEA J. de Launay", amount: "+0,86 M€", pct: "+17,1 %" },
    { name: "18 r. Fbg Montmartre", entity: "SAS Palace", amount: "+0,72 M€", pct: "+9,4 %" },
    { name: "FPCI Horizon 2019", entity: "Groupe FDL", amount: "+0,58 M€", pct: "+21,6 %" },
    { name: "Hermès Intl", entity: "FDL Invest", amount: "+0,41 M€", pct: "+12,8 %" },
  ],
  topDetract: [
    { name: "Medtech SAS (série B)", entity: "FDL Invest", amount: "−0,32 M€", pct: "−18,0 %" },
    { name: "Obligation Atos 2027", entity: "CTO UBS", amount: "−0,18 M€", pct: "−9,2 %" },
    { name: "Kering", entity: "CTO BNP", amount: "−0,11 M€", pct: "−6,4 %" },
  ],
  alerts: [
    { tone: "amber", title: "Covenant LTV proche du seuil", desc: "Financière du Louvre — LTV 54,0 % / seuil 55 % (marge 1,0 pt)" },
    { tone: "amber", title: "Capital call attendu", desc: "FPCI Horizon 2019 — appel estimé 350 k€ avant le 30/09/2026" },
    { tone: "red", title: "Valorisation ancienne", desc: "Medtech SAS — dernière valorisation 14 mois (mars 2025)" },
    { tone: "blue", title: "Échéance de dette 12 mois", desc: "Crédit relais Patrimoine de Rivoli — 2,1 M€ au 15/03/2027" },
  ],
  netWorthSeries: [44.8, 45.2, 46.1, 45.7, 46.9, 47.8, 48.4, 49.6, 50.2, 49.8, 51.3, 52.4, 53.0, 52.6, 53.8, 54.5, 55.1, 54.8, 55.6, 56.0, 55.7, 56.4],
  maturitySeries: [
    { y: "2026", v: 0.8 }, { y: "2027", v: 2.1 }, { y: "2028", v: 4.3 },
    { y: "2029", v: 3.4 }, { y: "2030", v: 5.6 }, { y: "2031+", v: 11.6 },
  ],
};

const SYN_ALLOC_COLORS = {
  dark: { immo: "#C9A45C", cote: "#3FD6A4", pe: "#5BA3EA", priv: "#9A7BD0", cash: "#5C6678", av: "#3C4759" },
  light: { immo: "#A37E33", cote: "#0E9A72", pe: "#2873C4", priv: "#7A5BBF", cash: "#98A2B3", av: "#C5CCD8" },
};

// ---------- Atomes partagés ----------

function SynLabel({ t, children, color, size = 10, style }) {
  return (
    <div style={{ fontSize: size, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: color || t.textMuted, ...style }}>{children}</div>
  );
}

function SynBadge({ t, tone = "teal", children, style }) {
  const map = {
    teal: { bg: t.tealDim, fg: t.teal },
    red: { bg: t.redDim, fg: t.red },
    amber: { bg: t.amberDim, fg: t.amber },
    blue: { bg: t.blueDim, fg: t.blue },
    gold: { bg: t.goldDim, fg: t.gold },
    neutral: { bg: t.name === "dark" ? "rgba(139,149,167,.12)" : "rgba(95,107,126,.10)", fg: t.textMuted },
  };
  const c = map[tone] || map.neutral;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: c.bg, color: c.fg, border: `1px solid ${c.fg}33`, borderRadius: 4, padding: "2px 7px", fontSize: 11, fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", ...style }}>{children}</span>
  );
}

function SynCard({ t, children, style, pad = 18 }) {
  return (
    <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: pad, ...style }}>{children}</div>
  );
}

function SynDonut({ t, data, size = 132, stroke = 16, centerTop, centerBottom }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const colors = SYN_ALLOC_COLORS[t.name];
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {data.map((d, i) => {
        const frac = d.pct / 100;
        const dash = frac * c;
        const off = -acc * c;
        acc += frac;
        return (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={colors[d.key]} strokeWidth={stroke}
            strokeDasharray={`${dash - 1.5} ${c - dash + 1.5}`} strokeDashoffset={off}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        );
      })}
      {centerTop && <text x="50%" y="47%" textAnchor="middle" fill={t.text} fontSize="17" fontWeight="600" fontFamily={SYN_FONT} style={{ fontVariantNumeric: "tabular-nums" }}>{centerTop}</text>}
      {centerBottom && <text x="50%" y="60%" textAnchor="middle" fill={t.textMuted} fontSize="9.5" fontWeight="600" letterSpacing="0.1em" fontFamily={SYN_FONT}>{centerBottom}</text>}
    </svg>
  );
}

function SynLine({ t, series, w = 420, h = 110, color }) {
  const min = Math.min(...series), max = Math.max(...series);
  const pad = 6;
  const pts = series.map((v, i) => {
    const x = pad + (i / (series.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return [x, y];
  });
  const dPath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${dPath} L${pts[pts.length - 1][0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`;
  const col = color || t.teal;
  const gid = "g" + Math.round(Math.random() * 1e6);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", width: "100%" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.22" />
          <stop offset="100%" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={dPath} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={col} />
    </svg>
  );
}

function SynBars({ t, data, w = 420, h = 120, color, highlightIdx = -1 }) {
  const max = Math.max(...data.map((d) => d.v));
  const gap = 14;
  const bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg width={w} height={h + 18} viewBox={`0 0 ${w} ${h + 18}`} style={{ display: "block", width: "100%" }}>
      {data.map((d, i) => {
        const bh = Math.max(3, (d.v / max) * (h - 14));
        const x = i * (bw + gap);
        const col = i === highlightIdx ? t.amber : color || t.gold;
        return (
          <g key={i}>
            <rect x={x} y={h - bh} width={bw} height={bh} rx="3" fill={col} opacity={i === highlightIdx ? 1 : 0.75} />
            <text x={x + bw / 2} y={h - bh - 5} textAnchor="middle" fill={t.text} fontSize="10.5" fontWeight="600" fontFamily={SYN_FONT} style={{ fontVariantNumeric: "tabular-nums" }}>{String(d.v).replace(".", ",")}</text>
            <text x={x + bw / 2} y={h + 13} textAnchor="middle" fill={t.textFaint} fontSize="10" fontFamily={SYN_FONT}>{d.y}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Petit logo Synapse
function SynLogo({ t, size = 17, sub = true }) {
  return (
    <div>
      <div style={{ fontFamily: SYN_SERIF, fontSize: size, fontWeight: 600, letterSpacing: "0.22em", color: t.text }}>SYNAPSE</div>
      {sub && <div style={{ fontSize: 7.5, letterSpacing: "0.3em", color: t.textMuted, textTransform: "uppercase", marginTop: 2 }}>Wealth Management</div>}
    </div>
  );
}

Object.assign(window, {
  SYN_DARK, SYN_LIGHT, SYN_FONT, SYN_SERIF, FDL, SYN_ALLOC_COLORS,
  SynLabel, SynBadge, SynCard, SynDonut, SynLine, SynBars, SynLogo,
});
