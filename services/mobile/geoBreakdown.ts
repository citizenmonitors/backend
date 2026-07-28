import { readFileSync } from "fs";
import { projectPath } from "../../utils/projectRoot.ts";
import lgaData from "../../data/lgaData.json" with { type: "json" };

type GroupByField = "state" | "lga" | "ward";

type PartyVote = { party: string; count: number };

type ResultRow = {
  state?: string | null;
  lga?: string | null;
  ward?: string | null;
  pollingUnit?: string | null;
  partiesVotes?: PartyVote[];
};

type IncidentRow = {
  state?: string | null;
  lga?: string | null;
  ward?: string | null;
  pollingUnit?: string | null;
};

type Viewer = {
  state?: string | null;
  lga?: string | null;
  ward?: string | null;
};

type PollingUnitsState = {
  state: string;
  lgas: Array<{
    lga: string;
    wards: Array<{ ward: string; polling_units: string[] }>;
  }>;
};

const normalize = (value: unknown): string =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[-\s_/]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .trim();

const displayName = (value: string): string =>
  String(value ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const PARTY_COLORS: Record<string, string> = {
  APC: "#008751",
  PDP: "#E53935",
  LP: "#F57C00",
  NNPP: "#827717",
  ADP: "#1565C0",
  APGA: "#2E7D32",
  YPP: "#6A1B9A",
  AAC: "#00838F",
  ADC: "#C62828",
  SDP: "#AD1457",
};

let puIndexCache:
  | {
      byState: Map<string, number>;
      byLga: Map<string, number>;
      byWard: Map<string, number>;
    }
  | null = null;

const getPollingUnitIndex = () => {
  if (puIndexCache) return puIndexCache;

  const raw = JSON.parse(
    readFileSync(projectPath("state-data", "polling-units.json"), "utf-8")
  ) as PollingUnitsState[];

  const byState = new Map<string, number>();
  const byLga = new Map<string, number>();
  const byWard = new Map<string, number>();

  for (const stateRow of raw) {
    const stateKey = normalize(stateRow.state);
    let stateTotal = 0;
    for (const lgaRow of stateRow.lgas ?? []) {
      const lgaKey = `${stateKey}|${normalize(lgaRow.lga)}`;
      let lgaTotal = 0;
      for (const wardRow of lgaRow.wards ?? []) {
        const wardKey = `${lgaKey}|${normalize(wardRow.ward)}`;
        const count = wardRow.polling_units?.length ?? 0;
        byWard.set(wardKey, count);
        lgaTotal += count;
      }
      byLga.set(lgaKey, lgaTotal);
      stateTotal += lgaTotal;
    }
    byState.set(stateKey, stateTotal);
  }

  puIndexCache = { byState, byLga, byWard };
  return puIndexCache;
};

const totalPollingUnitsForRegion = (
  groupBy: GroupByField,
  regionKey: string,
  user: Viewer
): number | null => {
  const index = getPollingUnitIndex();
  const stateKey = normalize(user.state);

  if (groupBy === "state") {
    return index.byState.get(normalize(regionKey)) ?? null;
  }
  if (groupBy === "lga") {
    const key = `${stateKey}|${normalize(regionKey)}`;
    const direct = index.byLga.get(key);
    if (direct != null) return direct;
    // Fallback: match LGA across any state (district elections)
    for (const [k, v] of index.byLga) {
      if (k.endsWith(`|${normalize(regionKey)}`)) return v;
    }
    return null;
  }
  if (groupBy === "ward") {
    const lgaKey = normalize(user.lga);
    const key = `${stateKey}|${lgaKey}|${normalize(regionKey)}`;
    return index.byWard.get(key) ?? null;
  }
  return null;
};

const regionKeyFromRow = (
  row: { state?: string | null; lga?: string | null; ward?: string | null },
  groupBy: GroupByField
): string | null => {
  const raw = row[groupBy];
  if (raw == null || String(raw).trim() === "") return null;
  return normalize(raw);
};

export const resolveGeoGroupBy = (
  electionType: string | undefined
): { groupBy: GroupByField; scopeLabel: string } => {
  const t = String(electionType ?? "").toLowerCase();
  if (t === "national") {
    return {
      groupBy: "state",
      scopeLabel: "Nigeria",
    };
  }
  if (t === "senatorial" || t === "house-of-representatives") {
    return {
      groupBy: "lga",
      scopeLabel:
        t === "senatorial"
          ? "Senatorial District"
          : "House of Representatives District",
    };
  }
  if (t === "gubernatorial" || t === "house-of-assembly") {
    return {
      groupBy: "lga",
      scopeLabel: "State",
    };
  }
  if (t === "lga") {
    return {
      groupBy: "ward",
      scopeLabel: "LGA",
    };
  }
  return {
    groupBy: "lga",
    scopeLabel: "Coverage",
  };
};

const resolveScopeDisplay = (
  electionType: string | undefined,
  user: Viewer,
  scopeLabel: string
): string => {
  const t = String(electionType ?? "").toLowerCase();
  if (t === "national") return "Nigeria";
  if (t === "gubernatorial" || t === "house-of-assembly") {
    return displayName(String(user.state ?? scopeLabel));
  }
  if (t === "lga") {
    return displayName(String(user.lga ?? scopeLabel));
  }
  if (t === "senatorial" || t === "house-of-representatives") {
    const district = lgaData.find(
      (lga) =>
        String(lga.name).toUpperCase() === String(user.lga ?? "").toUpperCase()
    );
    if (t === "senatorial") {
      return String(district?.senatorial_district ?? scopeLabel);
    }
    return String(district?.house_of_representatives ?? scopeLabel);
  }
  return scopeLabel;
};

/**
 * Mobile Collation “Geo Breakdown” cards — grouped by election-type location filter.
 * national → state; gubernatorial/HoA/senatorial/HoR → LGA; lga → ward.
 */
export const buildMobileGeoBreakdown = (input: {
  electionType: string | undefined;
  user: Viewer;
  results: ResultRow[];
  incidents: IncidentRow[];
}) => {
  const { groupBy, scopeLabel } = resolveGeoGroupBy(input.electionType);
  const scopeDisplay = resolveScopeDisplay(
    input.electionType,
    input.user,
    scopeLabel
  );

  type RegionAgg = {
    regionKey: string;
    regionName: string;
    partiesVotes: Record<string, number>;
    resultPollingUnits: Set<string>;
    incidentPollingUnits: Set<string>;
    resultsCount: number;
    incidentsCount: number;
  };

  const regions = new Map<string, RegionAgg>();

  const ensure = (key: string, rawName: string): RegionAgg => {
    let row = regions.get(key);
    if (!row) {
      row = {
        regionKey: key,
        regionName: displayName(rawName),
        partiesVotes: {},
        resultPollingUnits: new Set(),
        incidentPollingUnits: new Set(),
        resultsCount: 0,
        incidentsCount: 0,
      };
      regions.set(key, row);
    }
    return row;
  };

  for (const result of input.results) {
    const key = regionKeyFromRow(result, groupBy);
    if (!key) continue;
    const raw = String(result[groupBy] ?? key);
    const agg = ensure(key, raw);
    agg.resultsCount += 1;
    if (result.pollingUnit) {
      agg.resultPollingUnits.add(String(result.pollingUnit).trim());
    }
    for (const pv of result.partiesVotes ?? []) {
      if (!pv?.party) continue;
      const votes = Number(pv.count) || 0;
      agg.partiesVotes[pv.party] = (agg.partiesVotes[pv.party] || 0) + votes;
    }
  }

  for (const incident of input.incidents) {
    const key = regionKeyFromRow(incident, groupBy);
    if (!key) continue;
    const raw = String(incident[groupBy] ?? key);
    const agg = ensure(key, raw);
    agg.incidentsCount += 1;
    if (incident.pollingUnit) {
      agg.incidentPollingUnits.add(String(incident.pollingUnit).trim());
    }
  }

  let grandTotalVotes = 0;
  const regionList = [...regions.values()].map((agg) => {
    const totalVotes = Object.values(agg.partiesVotes).reduce(
      (sum, n) => sum + n,
      0
    );
    grandTotalVotes += totalVotes;
    const reportedPollingUnits = new Set([
      ...agg.resultPollingUnits,
      ...agg.incidentPollingUnits,
    ]).size;
    const totalPollingUnits = totalPollingUnitsForRegion(
      groupBy,
      agg.regionKey,
      input.user
    );

    const parties = Object.entries(agg.partiesVotes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7)
      .map(([party, votes]) => ({
        party,
        votes,
        percent:
          totalVotes > 0 ? Math.round((votes / totalVotes) * 1000) / 10 : 0,
        color: PARTY_COLORS[party.toUpperCase()] ?? null,
      }));

    return {
      regionName: agg.regionName,
      resultsCount: agg.resultsCount,
      incidentsCount: agg.incidentsCount,
      reportedPollingUnits,
      totalPollingUnits,
      totalVotes,
      percentOfTotalVotes: 0, // filled after grand total known
      parties,
    };
  });

  for (const region of regionList) {
    region.percentOfTotalVotes =
      grandTotalVotes > 0
        ? Math.round((region.totalVotes / grandTotalVotes) * 1000) / 10
        : 0;
  }

  regionList.sort((a, b) => b.totalVotes - a.totalVotes);

  const summaryReportedPus = new Set<string>();
  for (const r of input.results) {
    if (r.pollingUnit) summaryReportedPus.add(String(r.pollingUnit).trim());
  }
  for (const i of input.incidents) {
    if (i.pollingUnit) summaryReportedPus.add(String(i.pollingUnit).trim());
  }

  let summaryTotalPus: number | null = null;
  if (groupBy === "state") {
    summaryTotalPus = [...getPollingUnitIndex().byState.values()].reduce(
      (a, b) => a + b,
      0
    );
  } else if (groupBy === "lga") {
    const t = String(input.electionType ?? "").toLowerCase();
    if (t === "gubernatorial" || t === "house-of-assembly") {
      summaryTotalPus =
        getPollingUnitIndex().byState.get(normalize(input.user.state)) ?? null;
    } else {
      summaryTotalPus = regionList.reduce(
        (sum, r) => sum + (r.totalPollingUnits ?? 0),
        0
      );
      if (summaryTotalPus === 0) summaryTotalPus = null;
    }
  } else if (groupBy === "ward") {
    summaryTotalPus =
      getPollingUnitIndex().byLga.get(
        `${normalize(input.user.state)}|${normalize(input.user.lga)}`
      ) ?? null;
  }

  return {
    groupBy,
    summary: {
      resultsCount: input.results.length,
      incidentsCount: input.incidents.length,
      reportedPollingUnits: summaryReportedPus.size,
      totalPollingUnits: summaryTotalPus,
      scopeLabel: scopeDisplay,
    },
    regions: regionList,
  };
};
