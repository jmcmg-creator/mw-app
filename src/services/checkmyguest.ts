/**
 * Checkmyguest (CMG) integration.
 *
 * Ported from the legacy `daily-recap-whatsapp` Python pipeline
 * (api.py / api_jk.py / config.py). Authenticates, fetches host housing
 * stats, enriches unoccupied apartments with calendar prices and aggregates
 * occupancy / revenue per group.
 *
 * The JM and JK accounts share this single config-driven implementation.
 * The Guesty and umanV2 clients from the legacy files are intentionally not
 * migrated here — they belong to separate provider services.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** A data-driven rule routing an apartment name to a group. */
export type CmgGroupRule = {
  /** Name (uppercased) must contain at least one of these substrings. */
  match: string[];
  /** If set, the name must also contain at least one of these substrings. */
  also?: string[];
  /** Group assigned when the rule matches. */
  group: string;
};

export type CheckmyguestConfig = {
  /** API base URL, e.g. "https://api.checkmyguest.com/v2". */
  apiBase: string;
  /** Host id. When empty it is auto-detected after authentication. */
  hostId: string;
  /** Static API token. When absent, loginEmail/loginPassword are used. */
  token?: string;
  loginEmail?: string;
  loginPassword?: string;
  /** Names containing any of these substrings are dropped entirely. */
  excludePatterns: string[];
  /** Names matching any of these as a whole word are dropped entirely. */
  skipKeywords: string[];
  /** Ordered routing rules; the first match wins. */
  groupRules: CmgGroupRule[];
  /** Names starting with this prefix fall back to the "JM" group. */
  jmPrefix: string;
  /** Group used when no rule and no prefix matches. */
  fallbackGroup: string;
};

/** Preferred display order of the groups (from the legacy config). */
export const GROUP_ORDER = [
  "ASTORG",
  "BOURGOGNE",
  "FDL+FDV",
  "PPR",
  "CM+JCM+PR",
  "FVH",
  "LYONNAIS",
  "CONFIDENTIEL",
  "POG",
  "JM",
  "INDUSTRIELS D/G",
  "FDL + ASSOCIES",
];

/**
 * Group routing rules ported verbatim from config.py. Parsed in order; the
 * first matching rule wins. `also` narrows a rule to names that additionally
 * contain one of the listed substrings.
 */
export const DEFAULT_GROUP_RULES: CmgGroupRule[] = [
  {
    match: ["JCM"],
    also: [
      "STLAURENT",
      "ST-LAURENT",
      "SAINT-LAURENT",
      "POISSONNIERE",
      "POISSONIERE",
    ],
    group: "FVH",
  },
  { match: ["CM"], also: ["REPUBLIQUE"], group: "FVH" },
  {
    match: [
      "SAINTE-ELISABETH",
      "SAINTEELISABETH",
      "STE-ELISABETH",
      "STEELISABETH",
    ],
    group: "INDUSTRIELS D/G",
  },
  { match: ["CAIRE", "DUCAIRE", "DU-CAIRE"], group: "INDUSTRIELS D/G" },
  { match: ["SEBASTOPOL", "SÉBASTOPOL"], group: "INDUSTRIELS D/G" },
  { match: ["CHARONNE"], group: "FDL + ASSOCIES" },
  { match: ["PPR"], also: ["SAINTDENIS", "SAINT-DENIS"], group: "PPR" },
  { match: ["SAINTDENIS", "SAINT-DENIS"], group: "FDL + ASSOCIES" },
  { match: ["ASTORG"], group: "ASTORG" },
  { match: ["BOURGOGNE"], group: "BOURGOGNE" },
  {
    match: ["FERME DE LA", "FDL", "FERME DES MUSIC", "FDV", "FDM"],
    group: "FDL+FDV",
  },
  { match: ["PPR", "PELICAN"], group: "PPR" },
  {
    match: ["CITE DE LA MUSIQUE", "CM", "JCM", "PARC ROYAL", "PR"],
    group: "CM+JCM+PR",
  },
  { match: ["LYONNAIS"], group: "LYONNAIS" },
  { match: ["CONFIDENTIEL", "KONFIDENTIEL"], group: "CONFIDENTIEL" },
  { match: ["POG"], group: "POG" },
];

export const DEFAULT_EXCLUDE_PATTERNS = [
  "CAIRE-",
  "SEBASTOPOL-",
  "SAINTE-ELISABETH",
  "SEC PDR 64",
];

export const DEFAULT_SKIP_KEYWORDS = ["STOCK", "TEST", "LOBBY"];

export const DEFAULT_JM_PREFIX = "JM";

export const DEFAULT_FALLBACK_GROUP = "FDL + ASSOCIES";

/**
 * Builds a config from environment variables, defaulting the business rules
 * to the legacy production values. Pass `overrides` to tweak any field.
 */
export function loadCheckmyguestConfig(
  overrides: Partial<CheckmyguestConfig> = {},
): CheckmyguestConfig {
  return {
    apiBase: process.env.CMG_API_BASE ?? "",
    hostId: process.env.CMG_HOST_ID ?? "",
    token: process.env.CMG_TOKEN,
    loginEmail: process.env.CMG_EMAIL,
    loginPassword: process.env.CMG_PASSWORD,
    excludePatterns: DEFAULT_EXCLUDE_PATTERNS,
    skipKeywords: DEFAULT_SKIP_KEYWORDS,
    groupRules: DEFAULT_GROUP_RULES,
    jmPrefix: DEFAULT_JM_PREFIX,
    fallbackGroup: DEFAULT_FALLBACK_GROUP,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Raw API response shapes
// ---------------------------------------------------------------------------

type CmgReservation = {
  arrival_date?: string;
  departure_date?: string;
  status?: string;
  nights_count?: number;
  payout_in_cent?: number;
  revenue_in_cent?: number;
};

type CmgCalendarDay = {
  date?: string;
  price?: number;
  price_in_cent?: number;
};

type CmgHousing = {
  id?: string | number;
  name?: string;
  reservations?: CmgReservation[];
  calendar?: CmgCalendarDay[];
  price_per_night?: number;
  default_price?: number;
};

type CmgStatsResponse = {
  housings?: CmgHousing[];
};

type CmgCalendarResponse = {
  calendars?: Array<Record<string, CmgCalendarDay[]>>;
};

type CmgLoginResponse = {
  token?: string;
  host_id?: string | number;
  hostId?: string | number;
  user?: { host_id?: string | number };
};

// ---------------------------------------------------------------------------
// Processed output
// ---------------------------------------------------------------------------

export type ApartmentSummary = {
  name: string;
  price: number;
  occupied: boolean;
  guest: string;
};

export type GroupSummary = {
  apartments: ApartmentSummary[];
  total: number;
  occupied: number;
  revenue: number;
};

/** Occupancy summary keyed by group name. */
export type CmgProcessedData = Record<string, GroupSummary>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const OCCUPIED_STATUSES = new Set(["booked", "confirmed", "active"]);

function todayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function fetchJson<T>(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      throw new Error(
        `Checkmyguest request failed: ${res.status} ${res.statusText} (${url})`,
      );
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Drops a trailing "/v2" segment so the calendar endpoint can be reached. */
function calendarBaseUrl(apiBase: string): string {
  const base = apiBase.replace(/\/+$/, "");
  return base.endsWith("/v2") ? base.slice(0, -"/v2".length) : base;
}

// ---------------------------------------------------------------------------
// Group routing
// ---------------------------------------------------------------------------

/** Routes an apartment name to a group using the configured rules. */
export function getCmgGroup(name: string, config: CheckmyguestConfig): string {
  const upper = name.toUpperCase();
  for (const rule of config.groupRules) {
    if (!rule.match.some((kw) => upper.includes(kw))) continue;
    if (rule.also && !rule.also.some((kw) => upper.includes(kw))) continue;
    return rule.group;
  }
  if (upper.startsWith(config.jmPrefix.toUpperCase())) return "JM";
  return config.fallbackGroup;
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export type CmgAuth = {
  token: string;
  hostId: string;
};

/**
 * Resolves a token and host id. Uses the static token when configured,
 * otherwise logs in. The host id is auto-detected from the login response
 * or the /me endpoint when not provided explicitly.
 */
export async function resolveCmgAuth(
  config: CheckmyguestConfig,
): Promise<CmgAuth> {
  let token = config.token ?? "";
  let hostId = config.hostId;

  if (!token) {
    if (!config.loginEmail || !config.loginPassword) {
      throw new Error(
        "Checkmyguest: no token and no login credentials configured.",
      );
    }
    const data = await fetchJson<CmgLoginResponse>(
      `${config.apiBase}/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Both key spellings are sent — the JM and JK APIs differ.
        body: JSON.stringify({
          mail: config.loginEmail,
          email: config.loginEmail,
          password: config.loginPassword,
        }),
      },
      30_000,
    );
    token = data.token ?? "";
    if (!hostId) {
      hostId = String(data.host_id ?? data.hostId ?? data.user?.host_id ?? "");
    }
  }

  if (!token) {
    throw new Error("Checkmyguest: authentication failed (empty token).");
  }

  if (!hostId) {
    try {
      const me = await fetchJson<{ host_id?: string | number }>(
        `${config.apiBase}/me`,
        { headers: { Authorization: `Bearer ${token}` } },
        15_000,
      );
      hostId = String(me.host_id ?? "");
    } catch {
      // Leave hostId empty; fetchCmgData throws a clear error downstream.
    }
  }

  return { token, hostId };
}

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

/** Fetches the host's monthly housing stats. */
export async function fetchCmgData(
  auth: CmgAuth,
  config: CheckmyguestConfig,
): Promise<CmgStatsResponse> {
  if (!auth.hostId) {
    throw new Error("Checkmyguest: CMG host id is not configured.");
  }
  const today = new Date();
  const params = new URLSearchParams({
    month: String(today.getMonth() + 1),
    year: String(today.getFullYear()),
  });
  return fetchJson<CmgStatsResponse>(
    `${config.apiBase}/hosts/${auth.hostId}/housings/stats?${params}`,
    { headers: { Authorization: `Bearer ${auth.token}` } },
    60_000,
  );
}

/** Fetches today's calendar prices for the given housing IDs. */
export async function fetchCmgCalendar(
  token: string,
  housingIds: Array<string | number>,
  config: CheckmyguestConfig,
): Promise<CmgCalendarResponse> {
  const today = todayIso();
  try {
    return await fetchJson<CmgCalendarResponse>(
      `${calendarBaseUrl(config.apiBase)}/host/calendar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          housings_id: housingIds,
          start_date: today,
          end_date: today,
        }),
      },
      60_000,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Checkmyguest calendar API error: ${message}`);
    return { calendars: [] };
  }
}

/** Enriches unoccupied housings with their calendar price (batched by 50). */
export async function enrichWithCalendar(
  token: string,
  data: CmgStatsResponse,
  config: CheckmyguestConfig,
): Promise<CmgStatsResponse> {
  const housings = data.housings ?? [];
  if (housings.length === 0) return data;

  const ids = housings
    .map((h) => h.id)
    .filter((id): id is string | number => Boolean(id));
  if (ids.length === 0) return data;

  const calendars = new Map<string, CmgCalendarDay[]>();
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const calData = await fetchCmgCalendar(token, batch, config);
    for (const calObj of calData.calendars ?? []) {
      for (const [hid, days] of Object.entries(calObj)) {
        calendars.set(String(hid), days);
      }
    }
  }

  for (const housing of housings) {
    const days = calendars.get(String(housing.id ?? ""));
    if (days) housing.calendar = days;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Aggregates raw housing stats into per-group occupancy and revenue.
 * Occupied apartments use the reservation payout; vacant ones fall back to
 * the calendar price, then to the configured nightly price.
 */
export function processCmgData(
  data: CmgStatsResponse,
  config: CheckmyguestConfig,
): CmgProcessedData {
  const housings = data.housings ?? [];
  const todayStr = todayIso();
  const groups: CmgProcessedData = {};

  const groupFor = (name: string): GroupSummary => {
    const key = getCmgGroup(name, config);
    groups[key] ??= { apartments: [], total: 0, occupied: 0, revenue: 0 };
    return groups[key];
  };

  for (const housing of housings) {
    const name = (housing.name ?? "UNKNOWN").replace(/-?TESTABB$/i, "");
    const nameUpper = name.toUpperCase();

    if (config.excludePatterns.some((pattern) => nameUpper.includes(pattern))) {
      continue;
    }
    const isSkipped = config.skipKeywords.some((keyword) =>
      new RegExp(`\\b${escapeRegExp(keyword)}\\b`).test(nameUpper),
    );
    if (isSkipped) continue;

    const group = groupFor(name);
    group.total += 1;

    const reservations = housing.reservations ?? [];
    const todayReservations = reservations.filter(
      (r) =>
        (r.arrival_date ?? "").slice(0, 10) <= todayStr &&
        (r.departure_date ?? "").slice(0, 10) > todayStr &&
        OCCUPIED_STATUSES.has((r.status ?? "").toLowerCase()),
    );
    const isOccupied = todayReservations.length > 0;
    let price = 0;

    if (isOccupied) {
      const reservation = todayReservations[0];
      const nights = reservation.nights_count || 1;
      const payoutCents =
        reservation.payout_in_cent || reservation.revenue_in_cent || 0;
      price = Math.round(payoutCents / nights / 100);
      group.occupied += 1;
      group.revenue += price;
    } else {
      for (const day of housing.calendar ?? []) {
        if (String(day.date ?? "").slice(0, 10) !== todayStr) continue;
        let raw = Number(day.price || day.price_in_cent || 0);
        if (!Number.isFinite(raw)) raw = 0;
        if (raw && raw > 500) price = Math.round(raw / 100);
        else if (raw) price = Math.round(raw);
        break;
      }
      if (price === 0) {
        price = Math.round(
          Number(housing.price_per_night || housing.default_price || 0),
        );
      }
    }

    const cleanName = name
      .replace(/\s+NEW\b/i, "")
      .trim()
      .replace(/\s{2,}/g, " ");
    group.apartments.push({
      name: cleanName,
      price,
      occupied: isOccupied,
      guest: "",
    });
  }

  return groups;
}

/**
 * End-to-end snapshot: authenticate, fetch stats, enrich with calendar
 * prices and aggregate per group.
 */
export async function getCheckmyguestSnapshot(
  config: CheckmyguestConfig = loadCheckmyguestConfig(),
): Promise<CmgProcessedData> {
  const auth = await resolveCmgAuth(config);
  const data = await fetchCmgData(auth, config);
  const enriched = await enrichWithCalendar(auth.token, data, config);
  return processCmgData(enriched, config);
}
