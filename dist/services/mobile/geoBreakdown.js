import { readFileSync } from "fs";
import { projectPath } from "../../utils/projectRoot.js";
import lgaData from "../../data/lgaData.json" with { type: "json" };
import { aggregateElectionResultsByGeo } from "../Election/electionLive.js";
const normalize = (value) => String(value ?? "")
    .toLowerCase()
    .replace(/[-\s_/]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .trim();
const displayName = (value) => String(value ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
const PARTY_COLORS = {
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
let puIndexCache = null;
const getPollingUnitIndex = () => {
    if (puIndexCache)
        return puIndexCache;
    const raw = JSON.parse(readFileSync(projectPath("state-data", "polling-units.json"), "utf-8"));
    const byState = new Map();
    const byLga = new Map();
    const byWard = new Map();
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
const totalPollingUnitsForRegion = (groupBy, regionKey, user) => {
    const index = getPollingUnitIndex();
    const stateKey = normalize(user.state);
    if (groupBy === "state") {
        return index.byState.get(normalize(regionKey)) ?? null;
    }
    if (groupBy === "lga") {
        const key = `${stateKey}|${normalize(regionKey)}`;
        const direct = index.byLga.get(key);
        if (direct != null)
            return direct;
        for (const [k, v] of index.byLga) {
            if (k.endsWith(`|${normalize(regionKey)}`))
                return v;
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
const regionKeyFromRow = (row, groupBy) => {
    const raw = row[groupBy];
    if (raw == null || String(raw).trim() === "")
        return null;
    return String(raw).trim();
};
export const resolveGeoGroupBy = (electionType) => {
    const t = String(electionType ?? "").toLowerCase().trim();
    if (t === "national" || t === "presidential") {
        return { groupBy: "state", scopeLabel: "Nigeria" };
    }
    if (t === "senatorial" || t === "house-of-representatives") {
        return {
            groupBy: "lga",
            scopeLabel: t === "senatorial"
                ? "Senatorial District"
                : "House of Representatives District",
        };
    }
    if (t === "gubernatorial" || t === "house-of-assembly") {
        return { groupBy: "lga", scopeLabel: "State" };
    }
    if (t === "lga" || t === "local-government" || t === "local_government") {
        return { groupBy: "ward", scopeLabel: "LGA" };
    }
    return { groupBy: "lga", scopeLabel: "Coverage" };
};
const resolveScopeDisplay = (electionType, user, scopeLabel) => {
    const t = String(electionType ?? "").toLowerCase().trim();
    if (t === "national" || t === "presidential")
        return "Nigeria";
    if (t === "gubernatorial" || t === "house-of-assembly") {
        return displayName(String(user.state ?? scopeLabel));
    }
    if (t === "lga" || t === "local-government" || t === "local_government") {
        return displayName(String(user.lga ?? scopeLabel));
    }
    if (t === "senatorial" || t === "house-of-representatives") {
        const district = lgaData.find((lga) => String(lga.name).toUpperCase() === String(user.lga ?? "").toUpperCase());
        if (t === "senatorial") {
            return String(district?.senatorial_district ?? scopeLabel);
        }
        return String(district?.house_of_representatives ?? scopeLabel);
    }
    return scopeLabel;
};
/** Live chart rows look like `{ party: "APC", APC: 1200 }`. */
export const chartRowsToVotesMap = (chart) => {
    const map = {};
    for (const row of chart ?? []) {
        const party = String(row.party ?? "").trim();
        if (!party)
            continue;
        const votes = Number(row[party] ?? row.votes ?? row.count ?? row.Votes ?? 0) || 0;
        if (votes <= 0)
            continue;
        map[party] = (map[party] || 0) + votes;
    }
    return map;
};
const partiesFromVotesMap = (partiesVotes, totalVotes) => Object.entries(partiesVotes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([party, votes]) => ({
    party,
    votes,
    percent: totalVotes > 0 ? Math.round((votes / totalVotes) * 1000) / 10 : 0,
    color: PARTY_COLORS[party.toUpperCase()] ?? null,
}));
const votesMapToChartRows = (partiesVotes) => Object.entries(partiesVotes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 7)
    .map(([party, votes]) => ({ party, [party]: votes }));
const emptyGeo = (groupBy, scopeDisplay, resultsCount, incidentsCount) => ({
    groupBy,
    summary: {
        resultsCount,
        incidentsCount,
        reportedPollingUnits: 0,
        totalPollingUnits: null,
        scopeLabel: scopeDisplay,
        totalVotes: 0,
    },
    regions: [],
});
/**
 * Prefer live `result` (same object that powers the chart). Falls back to
 * re-aggregating raw observer rows only if live result has no usable regions.
 */
export const buildMobileGeoBreakdown = (input) => {
    const { groupBy, scopeLabel } = resolveGeoGroupBy(input.electionType);
    const scopeDisplay = resolveScopeDisplay(input.electionType, input.user, scopeLabel);
    const incidents = input.incidents ?? [];
    const results = input.results ?? [];
    const seeds = [];
    let overallChart = [];
    let aggregateAnalysis = {};
    const live = input.liveResult;
    // National: result is an array of `{ state, chart, aggregateAnalysis }`.
    if (Array.isArray(live) && live.length > 0) {
        const first = live[0];
        aggregateAnalysis = { ...(first.aggregateAnalysis ?? {}) };
        overallChart = votesMapToChartRows(aggregateAnalysis);
        for (const item of live) {
            const regionKey = String(item.state ?? "").trim();
            if (!regionKey)
                continue;
            const partiesVotes = chartRowsToVotesMap(item.chart);
            seeds.push({
                regionKey,
                partiesVotes,
                resultsCount: 0,
                chart: item.chart ?? votesMapToChartRows(partiesVotes),
            });
        }
    }
    else if (live && typeof live === "object") {
        const obj = live;
        aggregateAnalysis = { ...(obj.aggregateAnalysis ?? {}) };
        overallChart = Array.isArray(obj.chart)
            ? obj.chart
            : votesMapToChartRows(aggregateAnalysis);
        // Preferred: live already computed per-location regions for the chart.
        for (const row of obj.regions ?? []) {
            const regionKey = String(row.regionKey ?? row[groupBy] ?? row.state ?? row.lga ?? row.ward ?? "").trim();
            if (!regionKey)
                continue;
            const fromMap = row.partiesVotes &&
                typeof row.partiesVotes === "object" &&
                !Array.isArray(row.partiesVotes)
                ? row.partiesVotes
                : null;
            const partiesVotes = fromMap ?? chartRowsToVotesMap(row.chart);
            seeds.push({
                regionKey,
                partiesVotes,
                resultsCount: Number(row.resultsCount) || 0,
                chart: row.chart ?? votesMapToChartRows(partiesVotes),
            });
        }
        // Chart has totals but regions missing/empty → one region from overall chart
        // is wrong for geo; re-aggregate from raw rows instead.
        if (seeds.length === 0 && results.length > 0) {
            const geo = aggregateElectionResultsByGeo(results.map((r) => ({
                userRole: r.userRole ?? "observer",
                state: r.state ?? undefined,
                lga: r.lga ?? undefined,
                ward: r.ward ?? undefined,
                partiesVotes: (r.partiesVotes ?? []).map((pv) => ({
                    party: String(pv.party ?? ""),
                    count: Number(pv.count ?? pv.votes) || 0,
                })),
            })), groupBy);
            aggregateAnalysis = geo.aggregateAnalysis;
            overallChart = geo.overallChart;
            for (const r of geo.regions) {
                seeds.push({
                    regionKey: r.regionKey,
                    partiesVotes: r.partiesVotes,
                    resultsCount: r.resultsCount,
                    chart: r.chart,
                });
            }
        }
        // Last resort: expose overall chart as a single coverage region so UI
        // is never empty when chart has numbers.
        if (seeds.length === 0) {
            const partiesVotes = Object.keys(aggregateAnalysis).length > 0
                ? aggregateAnalysis
                : chartRowsToVotesMap(overallChart);
            if (Object.keys(partiesVotes).length > 0) {
                seeds.push({
                    regionKey: scopeDisplay || "Coverage",
                    partiesVotes,
                    resultsCount: results.length,
                    chart: overallChart.length
                        ? overallChart
                        : votesMapToChartRows(partiesVotes),
                });
            }
        }
    }
    else if (results.length > 0) {
        const geo = aggregateElectionResultsByGeo(results.map((r) => ({
            userRole: r.userRole ?? "observer",
            state: r.state ?? undefined,
            lga: r.lga ?? undefined,
            ward: r.ward ?? undefined,
            partiesVotes: (r.partiesVotes ?? []).map((pv) => ({
                party: String(pv.party ?? ""),
                count: Number(pv.count ?? pv.votes) || 0,
            })),
        })), groupBy);
        aggregateAnalysis = geo.aggregateAnalysis;
        overallChart = geo.overallChart;
        for (const r of geo.regions) {
            seeds.push({
                regionKey: r.regionKey,
                partiesVotes: r.partiesVotes,
                resultsCount: r.resultsCount,
                chart: r.chart,
            });
        }
    }
    if (seeds.length === 0) {
        return emptyGeo(groupBy, scopeDisplay, results.length, incidents.length);
    }
    const incidentByRegion = new Map();
    for (const incident of incidents) {
        const key = regionKeyFromRow(incident, groupBy);
        if (!key)
            continue;
        let row = incidentByRegion.get(key);
        if (!row) {
            row = { count: 0, pollingUnits: new Set() };
            incidentByRegion.set(key, row);
        }
        row.count += 1;
        if (incident.pollingUnit) {
            row.pollingUnits.add(String(incident.pollingUnit).trim());
        }
    }
    const resultPuByRegion = new Map();
    const resultsCountByRegion = new Map();
    for (const result of results) {
        const key = regionKeyFromRow(result, groupBy);
        if (!key)
            continue;
        resultsCountByRegion.set(key, (resultsCountByRegion.get(key) ?? 0) + 1);
        if (!result.pollingUnit)
            continue;
        let set = resultPuByRegion.get(key);
        if (!set) {
            set = new Set();
            resultPuByRegion.set(key, set);
        }
        set.add(String(result.pollingUnit).trim());
    }
    // Merge incident-only regions.
    for (const key of incidentByRegion.keys()) {
        if (!seeds.some((s) => s.regionKey === key)) {
            seeds.push({
                regionKey: key,
                partiesVotes: {},
                resultsCount: 0,
                chart: [],
            });
        }
    }
    const chartTotalVotes = Object.values(aggregateAnalysis).reduce((sum, n) => sum + Number(n || 0), 0);
    const fallbackTotal = chartTotalVotes > 0
        ? chartTotalVotes
        : seeds.reduce((sum, s) => sum +
            Object.values(s.partiesVotes).reduce((a, b) => a + b, 0), 0);
    const regionList = seeds.map((seed) => {
        const partiesVotes = seed.partiesVotes;
        const totalVotes = Object.values(partiesVotes).reduce((s, n) => s + n, 0);
        const incident = incidentByRegion.get(seed.regionKey);
        const reportedPollingUnits = new Set([
            ...(resultPuByRegion.get(seed.regionKey) ?? []),
            ...(incident?.pollingUnits ?? []),
        ]).size;
        return {
            regionName: displayName(seed.regionKey),
            resultsCount: seed.resultsCount || resultsCountByRegion.get(seed.regionKey) || 0,
            incidentsCount: incident?.count ?? 0,
            reportedPollingUnits,
            totalPollingUnits: totalPollingUnitsForRegion(groupBy, seed.regionKey, input.user),
            totalVotes,
            percentOfTotalVotes: fallbackTotal > 0
                ? Math.round((totalVotes / fallbackTotal) * 1000) / 10
                : 0,
            parties: partiesFromVotesMap(partiesVotes, totalVotes),
        };
    });
    regionList.sort((a, b) => b.totalVotes - a.totalVotes);
    const summaryReportedPus = new Set();
    for (const r of results) {
        if (r.pollingUnit)
            summaryReportedPus.add(String(r.pollingUnit).trim());
    }
    for (const i of incidents) {
        if (i.pollingUnit)
            summaryReportedPus.add(String(i.pollingUnit).trim());
    }
    let summaryTotalPus = null;
    if (groupBy === "state") {
        summaryTotalPus = [...getPollingUnitIndex().byState.values()].reduce((a, b) => a + b, 0);
    }
    else if (groupBy === "lga") {
        const t = String(input.electionType ?? "").toLowerCase();
        if (t === "gubernatorial" || t === "house-of-assembly") {
            summaryTotalPus =
                getPollingUnitIndex().byState.get(normalize(input.user.state)) ?? null;
        }
        else {
            summaryTotalPus = regionList.reduce((sum, r) => sum + (r.totalPollingUnits ?? 0), 0);
            if (summaryTotalPus === 0)
                summaryTotalPus = null;
        }
    }
    else if (groupBy === "ward") {
        summaryTotalPus =
            getPollingUnitIndex().byLga.get(`${normalize(input.user.state)}|${normalize(input.user.lga)}`) ?? null;
    }
    return {
        groupBy,
        summary: {
            resultsCount: results.length,
            incidentsCount: incidents.length,
            reportedPollingUnits: summaryReportedPus.size,
            totalPollingUnits: summaryTotalPus,
            scopeLabel: scopeDisplay,
            totalVotes: fallbackTotal,
        },
        regions: regionList,
    };
};
//# sourceMappingURL=geoBreakdown.js.map