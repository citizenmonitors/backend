import CompletedUser from "../../models/CompletedUser.js";
import ElectionData from "../../models/Election/ElectionData.js";
import Notification from "../../models/DailyTraffic/Notification.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import lgaData from "../../data/lgaData.json" with { type: "json" };
import AllState from "../../state-data/state.json" with { type: "json" };
import AllLga from "../../state-data/lga.json" with { type: "json" };
import AllWard from "../../state-data/wards.json" with { type: "json" };
import ActiveElection from "../../models/Election/ActiveElection.js";
const INCIDENT_COUNT_TEMPLATE = {
    "Ballot Stuffing": 0,
    "Thuggery & Violence": 0,
    "Underage Voting": 0,
    "INEC Misconduct": 0,
    "Result Alteration": 0,
    "Voter Intimidation": 0,
    "Late Opening": 0,
    "Missing Materials": 0,
    "Other Incidents": 0,
    // Legacy web values
    "Thuggery and Violence": 0,
    "Lack of electoral materials": 0,
    "Fraudulent electoral officers": 0,
    "Late commencement": 0,
    "Over voting": 0,
    Other: 0,
};
function emptyIncidentCounts() {
    return { ...INCIDENT_COUNT_TEMPLATE };
}
function bumpIncidentCount(row, selectIncident) {
    if (Object.prototype.hasOwnProperty.call(row, selectIncident)) {
        row[selectIncident]++;
    }
}
// Service to get all ongoing election results
export const getAllOngoingElectionResults = async (userId) => {
    try {
        const user = await CompletedUser.findById(userId).lean();
        if (!user)
            throw new Error("User not found");
        let ongoingElections = await ActiveElection.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
        })
            .populate("election", "electionType electionName")
            .populate("results")
            .lean();
        if (!ongoingElections || ongoingElections.length === 0) {
            return { message: "No ongoing election results" };
        }
        const prioritizedTypes = [
            "national",
            "senatorial",
            "house-of-representatives",
            "gubernatorial",
            "house-of-assembly",
            "lga",
        ];
        const typedOngoingElections = ongoingElections.filter((a) => a.results.filter((r) => r.userRole === "observer").length > 0);
        if (typedOngoingElections.length) {
            typedOngoingElections.sort(function (a, b) {
                return (prioritizedTypes.indexOf(a.election.electionType.toLowerCase()) -
                    prioritizedTypes.indexOf(b.election.electionType.toLowerCase()));
            });
            const highestPriorityElection = typedOngoingElections.at(0);
            if (!highestPriorityElection) {
                return { message: "No ongoing election results" };
            }
            const highestPriorityType = highestPriorityElection.election.electionType.toLowerCase();
            const highestPriorityName = highestPriorityElection.election.electionName;
            const priorityOngoingElections = typedOngoingElections.filter((a) => a.election.electionType.toLowerCase() === highestPriorityType);
            const priorityOngoingElectionsResults = priorityOngoingElections
                .map((a) => a.results)
                .flat();
            const result = await handleElectionResult(priorityOngoingElectionsResults, highestPriorityElection.election, user);
            return {
                electionDetails: {
                    electionType: highestPriorityType,
                    electionName: highestPriorityName,
                    mockElection: highestPriorityElection.mockElection,
                    electionLocation: highestPriorityElection.electionLocation,
                    startDate: highestPriorityElection.startDate,
                    endDate: highestPriorityElection.endDate,
                },
                result,
            };
        }
        else {
            return { message: "No ongoing election results" };
        }
    }
    catch (error) {
        console.error("Error fetching ongoing election results:", error);
        throw new Error(`Error fetching election details: ${error.message}`);
    }
};
// Helper function to handle election result fetching based on the election type
const handleElectionResult = async (results, election, user) => {
    // console.log(results.length, election);
    if (!election?.electionType) {
        console.warn("Election type is missing in selected election.");
        return { message: "Election type not found" };
    }
    if (election.electionType === "national") {
        return await fetchGroupedElectionResults(results, "state", 7, true);
    }
    else if (election.electionType === "gubernatorial") {
        return await fetchGroupedElectionResults(results, "state", 7, false, true);
    }
    else {
        if (results.length > 0) {
            const { chart, aggregateAnalysis } = getTopPartiesOverall(results, 7);
            const footer = computeFooter(results, "lga", election, user);
            const restriction = determineRestriction(election.electionType, user);
            // console.log({ chart, aggregateAnalysis, footer, restriction });
            return {
                chart,
                aggregateAnalysis,
                footer,
                restriction,
            };
        }
    }
    // console.log("No results available for this election.");
    return { message: "No results available for this election" };
};
// Fetch grouped election results with optional aggregate analysis per grouping
const fetchGroupedElectionResults = async (results, groupBy, topN, includeOverallAggregate = false, includeStateAggregate = false) => {
    return groupByStateAndAggregate(results, groupBy, topN, includeOverallAggregate, includeStateAggregate);
};
// Groups election results by state and includes aggregate analysis if needed
const groupByStateAndAggregate = (results, groupBy, topN, includeOverallAggregate, includeStateAggregate) => {
    const aggregated = {};
    const overallAggregateAnalysis = {};
    results.forEach((result) => {
        const key = String(result[groupBy] ?? "unknown");
        if (!aggregated[key]) {
            aggregated[key] = { partiesVotes: {} };
        }
        result.partiesVotes.forEach(({ party, count }) => {
            aggregated[key].partiesVotes[party] =
                (aggregated[key].partiesVotes[party] || 0) + count;
            if (includeOverallAggregate) {
                overallAggregateAnalysis[party] =
                    (overallAggregateAnalysis[party] || 0) + count;
            }
        });
    });
    const resultArray = Object.entries(aggregated).map(([key, data]) => {
        const topParties = getTopNParties(data.partiesVotes, topN);
        const result = {
            [groupBy]: key,
            chart: topParties,
        };
        if (includeStateAggregate) {
            result.aggregateAnalysis = topParties.reduce((acc, partyObj) => {
                const p = partyObj.party;
                acc[p] = Number(partyObj[p] ?? 0);
                return acc;
            }, {});
        }
        else if (includeOverallAggregate) {
            result.aggregateAnalysis = { ...overallAggregateAnalysis };
        }
        return result;
    });
    return resultArray;
};
// Get top N parties with vote counts for the chart
const getTopNParties = (partiesVotes, topN) => {
    return Object.entries(partiesVotes)
        .sort(([, aVotes], [, bVotes]) => Number(bVotes) - Number(aVotes))
        .slice(0, topN)
        .map(([party, votes]) => ({ party, [party]: votes }));
};
// Calculate top seven parties for non-grouped elections
const getTopPartiesOverall = (results, topN) => {
    const totalVotesByParty = {};
    results.forEach((result) => {
        result.partiesVotes.forEach(({ party, count }) => {
            totalVotesByParty[party] = (totalVotesByParty[party] || 0) + count;
        });
    });
    const chart = getTopNParties(totalVotesByParty, topN);
    return {
        chart,
        aggregateAnalysis: totalVotesByParty,
    };
};
// Define determineRestriction to handle restriction for other election types
const determineRestriction = (electionType, user) => {
    const lgaKey = user.lga ?? "";
    if (electionType === "senatorial") {
        return {
            name: "Senatorial District",
            value: getSenatorialDistrict(lgaKey) || "Unknown",
        };
    }
    else if (electionType === "house-of-representatives") {
        return {
            name: "House of Reps District",
            value: getHouseOfRepsDistrict(lgaKey) || "Unknown",
        };
    }
    else if (electionType === "lga") {
        return { name: "Ward", value: user.ward };
    }
    return null;
};
// Calculate footer for registered and submitted locations
const computeFooter = (data, groupBy, election, user) => {
    if (!election) {
        console.error("Invalid activeElection object:", election);
        throw new Error("Active election details are missing.");
    }
    let registeredLocations = new Set();
    let submittedLocations = new Set();
    switch (election.electionType) {
        case "national":
            registeredLocations = new Set(AllState.map((state) => state.toUpperCase()));
            break;
        case "senatorial":
        case "house-of-representatives":
            const districtData = lgaData.find((lga) => lga.name.toUpperCase() === (user.lga ?? "").toUpperCase());
            if (districtData) {
                registeredLocations = new Set(lgaData
                    .filter((lga) => lga.senatorial_district === districtData.senatorial_district)
                    .map((lga) => lga.name));
            }
            break;
        case "gubernatorial":
        case "house-of-assembly":
            const stateLGAs = AllLga.find((state) => state.state.toLowerCase() === (user.state ?? "").toLowerCase())?.lgas || [];
            registeredLocations = new Set(stateLGAs);
            break;
        case "lga":
            const lgaWards = AllWard.find((state) => state.state.toLowerCase() === (user.state ?? "").toLowerCase())?.lgas.find((lga) => lga.lga.toLowerCase() === (user.lga ?? "").toLowerCase())
                ?.wards || [];
            registeredLocations = new Set(lgaWards);
            break;
        default:
            registeredLocations = new Set();
    }
    submittedLocations = new Set(data
        .filter((item) => item.partiesVotes?.length || item.selectIncident)
        .map((item) => item[groupBy]));
    return {
        [`registered-${groupBy}s`]: registeredLocations.size,
        [`submitted-${groupBy}s`]: submittedLocations.size,
    };
};
// Service to get live election details for a specific election
export const getLiveElectionService = async (electionId, userId, options) => {
    try {
        const user = await CompletedUser.findById(userId).lean();
        if (!user)
            throw new Error("User not found");
        const activeElection = await ActiveElection.findById(electionId)
            .populate("election", "electionType electionName")
            .lean();
        if (!activeElection)
            throw new Error("Election not found");
        const electionRef = activeElection.election;
        let groupBy = "lga";
        let restriction = null;
        switch (electionRef?.electionType) {
            case "national":
                groupBy = "state";
                break;
            case "senatorial":
                groupBy = "lga";
                restriction = {
                    name: "Senatorial District",
                    value: getSenatorialDistrict(user.lga ?? "") || "Unknown",
                };
                break;
            case "house-of-representatives":
                groupBy = "lga";
                restriction = {
                    name: "House of Reps District",
                    value: getHouseOfRepsDistrict(user.lga ?? "") || "Unknown",
                };
                break;
            case "gubernatorial":
            case "house-of-assembly":
                groupBy = "lga";
                restriction = { name: "State", value: user.state };
                break;
            case "lga":
                groupBy = "ward";
                restriction = { name: "LGA", value: user.lga };
                break;
            default:
                groupBy = "lga";
        }
        let result = null;
        let incidentReport = null;
        let sentimentAnalysis = null;
        // Fetch election results and sentiment analysis based on location and grouping
        const approvedObservers = await CompletedUser.find({ role: "observer", isObserverInPollingUnit: true }, "_id").lean();
        const approvedObserverIds = approvedObservers.map((u) => u._id);
        const submitterFilter = {
            userRole: "observer",
            user: { $in: approvedObserverIds },
        };
        const scopedFilter = buildObserverSubmissionLocationFilter(electionRef?.electionType, user);
        const electionResults = await ElectionData.find({
            election: activeElection._id,
            ...submitterFilter,
            ...(Object.keys(scopedFilter).length > 0
                ? { $or: [scopedFilter, { user: userId }] }
                : {}),
        }).lean();
        if (electionResults.length > 0) {
            const { resultData, aggregateAnalysis } = aggregateResultsAndTopParties(electionResults, groupBy, electionRef?.electionType);
            const sentimentData = await getSentimentAnalysisService(electionId, groupBy, user, activeElection);
            result =
                electionRef?.electionType === "national"
                    ? resultData.map((stateResult) => ({
                        ...stateResult,
                        aggregateAnalysis,
                        footer: calculateFooter(electionResults, groupBy, activeElection, user),
                    }))
                    : {
                        chart: resultData,
                        footer: calculateFooter(electionResults, groupBy, activeElection, user),
                        aggregateAnalysis,
                        restriction,
                    };
            sentimentAnalysis = {
                chart: sentimentData.chart,
                aggregateAnalysis: aggregateCombinedSentiment(electionResults),
            };
        }
        // Fetch incident reports, restricted by the user's location for non-presidential elections
        const incidents = await IncidentReport.find({
            election: electionId,
            ...submitterFilter,
            ...(Object.keys(scopedFilter).length > 0
                ? { $or: [scopedFilter, { user: userId }] }
                : {}),
        }).lean();
        if (incidents.length > 0) {
            const { chart: incidentChart, aggregateAnalysis: incidentAggregateAnalysis, } = aggregateIncidentsByLocation(incidents, groupBy);
            incidentReport = {
                chart: incidentChart,
                footer: calculateFooter(incidents, groupBy, activeElection, user),
                aggregateAnalysis: incidentAggregateAnalysis,
                restriction,
            };
        }
        return {
            electionDetails: {
                electionType: electionRef?.electionType,
                electionName: electionRef?.electionName,
                mockElection: activeElection.mockElection,
                electionLocation: activeElection.electionLocation,
                startDate: activeElection.startDate,
                endDate: activeElection.endDate,
            },
            result,
            incidentReport,
            sentimentAnalysis,
        };
    }
    catch (error) {
        throw new Error(`Error fetching election details: ${error.message}`);
    }
};
// Aggregates election results and calculates the top seven parties for each grouping level (state, lga, or ward)
const aggregateResultsAndTopParties = (results, groupBy, electionType) => {
    const aggregated = {};
    const totalVotesByParty = {};
    results.forEach((result) => {
        const { state, partiesVotes, userRole } = result;
        if (userRole !== "observer" || !partiesVotes?.length)
            return;
        const key = groupBy === "state" ? state : null;
        const storageKey = String(key);
        if (!aggregated[storageKey]) {
            aggregated[storageKey] = { partiesVotes: {} };
        }
        partiesVotes.forEach(({ party, count }) => {
            aggregated[storageKey].partiesVotes[party] =
                (aggregated[storageKey].partiesVotes[party] || 0) + count;
            totalVotesByParty[party] = (totalVotesByParty[party] || 0) + count;
        });
    });
    const resultData = electionType === "national"
        ? Object.entries(aggregated).map(([state, data]) => ({
            state,
            chart: getTopSevenParties(data.partiesVotes),
        }))
        : getTopSevenParties(totalVotesByParty);
    return {
        resultData,
        aggregateAnalysis: totalVotesByParty,
    };
};
// Extracts the top seven parties with vote counts
const getTopSevenParties = (partiesVotes) => {
    return Object.entries(partiesVotes)
        .sort(([, aVotes], [, bVotes]) => Number(bVotes) - Number(aVotes))
        .slice(0, 7)
        .map(([party, votes]) => ({
        party,
        [party]: votes,
    }));
};
const getSenatorialDistrict = (userLGA) => {
    const districtData = lgaData.find((lga) => lga.name.toUpperCase() === userLGA.toUpperCase());
    return districtData?.senatorial_district;
};
// Helper function to fetch House of Reps District using lgaData
const getHouseOfRepsDistrict = (userLGA) => {
    const districtData = lgaData.find((lga) => lga.name.toUpperCase() === userLGA.toUpperCase());
    return districtData?.house_of_representatives;
};
// Helper function to get LGAs in the user's Senatorial District
const getLGAsInSenatorialDistrict = (userLGA) => {
    const districtData = lgaData.find((lga) => lga.name.toUpperCase() === userLGA.toUpperCase());
    return lgaData
        .filter((lga) => lga.senatorial_district === districtData?.senatorial_district)
        .map((lga) => lga.name);
};
// Helper function to get LGAs in the user's House of Reps District
const getLGAsInHouseOfRepsDistrict = (userLGA) => {
    const districtData = lgaData.find((lga) => lga.name.toUpperCase() === userLGA.toUpperCase());
    return lgaData
        .filter((lga) => lga.house_of_representatives === districtData?.house_of_representatives)
        .map((lga) => lga.name);
};
/** Mongo filter for observer result/incident rows visible in collation for this user. */
export const buildObserverSubmissionLocationFilter = (electionType, user) => {
    if (!electionType)
        return {};
    const t = electionType.toLowerCase();
    if (t === "gubernatorial" || t === "house-of-assembly") {
        return { state: user.state };
    }
    if (t === "senatorial") {
        return { lga: { $in: getLGAsInSenatorialDistrict(user.lga || "") } };
    }
    if (t === "house-of-representatives") {
        return { lga: { $in: getLGAsInHouseOfRepsDistrict(user.lga || "") } };
    }
    if (t === "lga") {
        return { ward: user.ward };
    }
    return {};
};
export const observerSubmissionDocMatchesLocationFilter = (doc, electionType, user) => {
    const f = buildObserverSubmissionLocationFilter(electionType, user);
    if (Object.keys(f).length === 0)
        return true;
    if ("state" in f && f.state != null) {
        return String(doc.state ?? "").trim() === String(f.state).trim();
    }
    if ("lga" in f &&
        f.lga &&
        typeof f.lga === "object" &&
        "$in" in f.lga) {
        const list = f.lga.$in.map((x) => String(x));
        return list.includes(String(doc.lga ?? ""));
    }
    if ("ward" in f && f.ward != null) {
        return String(doc.ward ?? "").trim() === String(f.ward).trim();
    }
    return true;
};
// Aggregates incident reports based on location and incident type
const aggregateIncidentsByLocation = (incidents, groupBy) => {
    const aggregated = {};
    const totalIncidentCounts = emptyIncidentCounts();
    incidents.forEach((incident) => {
        const { state, lga, ward, selectIncident } = incident;
        if (selectIncident == null || selectIncident === "")
            return;
        const key = groupBy === "state" ? state : groupBy === "lga" ? lga : ward;
        if (key == null)
            return;
        if (!aggregated[key]) {
            aggregated[key] = emptyIncidentCounts();
        }
        bumpIncidentCount(aggregated[key], selectIncident);
        bumpIncidentCount(totalIncidentCounts, selectIncident);
    });
    const chart = Object.entries(aggregated).map(([locKey, counts]) => ({
        [groupBy]: locKey,
        ...counts,
    }));
    return { chart, aggregateAnalysis: totalIncidentCounts };
};
// Helper function to aggregate sentiment analysis restricted to user's location
export const getSentimentAnalysisService = async (electionId, groupBy = "state", user, activeElection) => {
    // Restrict sentiment analysis to user's location if it's not a national election
    const electionData = await ElectionData.find({
        election: activeElection._id,
        userRole: "observer",
        ...buildObserverSubmissionLocationFilter(activeElection.election.electionType, user),
    }).lean();
    // Combine and aggregate sentiment data
    const combinedSentiment = aggregateCombinedSentiment(electionData);
    return {
        chart: combinedSentiment, // Return combined sentiment analysis
    };
};
// Helper Function to Aggregate Combined Sentiment Data
const aggregateCombinedSentiment = (results) => {
    const voteRating = { good: 0, okay: 0, poor: 0 };
    const voterIntimidation = { yes: 0, no: 0 };
    const voteBuying = { yes: 0, no: 0 };
    results.forEach((result) => {
        const { voteRating: vr, voterIntimidation: vi, voteBuying: vb, userRole } = result;
        if (userRole !== "observer")
            return;
        if (vr) {
            voteRating[vr] = (voteRating[vr] || 0) + 1;
        }
        if (vi) {
            voterIntimidation[vi] = (voterIntimidation[vi] || 0) + 1;
        }
        if (vb) {
            voteBuying[vb] = (voteBuying[vb] || 0) + 1;
        }
    });
    return {
        voteRating,
        voterIntimidation,
        voteBuying,
    };
};
// Helper function to calculate the footer for registered and submitted locations
const calculateFooter = (data, groupBy, activeElection, user) => {
    if (!activeElection || !activeElection.election) {
        console.error("Invalid activeElection object:", activeElection);
        throw new Error("Active election details are missing.");
    }
    let registeredLocations = new Set();
    let submittedLocations = new Set();
    switch (activeElection.election.electionType) {
        case "national":
            registeredLocations = new Set(AllState.map((state) => String(state).toUpperCase()));
            break;
        case "senatorial":
        case "house-of-representatives":
            const districtDataCalc = lgaData.find((lga) => lga.name.toUpperCase() === (user.lga ?? "").toUpperCase());
            if (districtDataCalc) {
                registeredLocations = new Set(lgaData
                    .filter((lga) => lga.senatorial_district === districtDataCalc.senatorial_district)
                    .map((lga) => lga.name));
            }
            break;
        case "gubernatorial":
        case "house-of-assembly":
            const stateLGAs = AllLga.find((s) => s.state.toLowerCase() === user.state?.toLowerCase())?.lgas || [];
            registeredLocations = new Set(stateLGAs);
            break;
        case "lga":
            const lgaWards = AllWard
                .find((s) => s.state.toLowerCase() === user.state?.toLowerCase())
                ?.lgas.find((lga) => lga.lga.toLowerCase() === user.lga?.toLowerCase())
                ?.wards || [];
            registeredLocations = new Set(lgaWards);
            break;
        default:
            registeredLocations = new Set();
    }
    submittedLocations = new Set(data
        .filter((item) => item.partiesVotes?.length || item.selectIncident)
        .map((item) => item[groupBy]));
    return {
        [`registered-${groupBy}s`]: registeredLocations.size,
        [`submitted-${groupBy}s`]: submittedLocations.size,
    };
};
export const getActivityBoardAndNotificationsService = async () => {
    try {
        // Total number of results
        const totalResults = await ElectionData.countDocuments({});
        // Aggregate observer results based on the `isObserverInPollingUnit` field
        const observerResultsAggregation = await ElectionData.aggregate([
            { $match: { userRole: "observer" } },
            {
                $lookup: {
                    from: "completedusers",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: "$userDetails" },
            {
                $group: {
                    _id: null,
                    totalObserverInPollingUnit: {
                        $sum: {
                            $cond: [
                                { $eq: ["$userDetails.isObserverInPollingUnit", true] },
                                1,
                                0,
                            ],
                        },
                    },
                    totalObserverNotInPollingUnit: {
                        $sum: {
                            $cond: [
                                { $eq: ["$userDetails.isObserverInPollingUnit", false] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);
        // Determine counts from aggregation results
        const totalObserverResults = observerResultsAggregation.length > 0
            ? observerResultsAggregation[0].totalObserverInPollingUnit
            : 0;
        const observerActingAsVolunteers = observerResultsAggregation.length > 0
            ? observerResultsAggregation[0].totalObserverNotInPollingUnit
            : 0;
        // Traditional volunteer results count
        const traditionalVolunteerResults = await ElectionData.countDocuments({
            userRole: "volunteer",
        });
        // Combine observers acting as volunteers with traditional volunteers
        const totalVolunteerResults = observerActingAsVolunteers + traditionalVolunteerResults;
        // Approved results count
        // const totalApprovedResults = await ElectionData.countDocuments({
        //   isApproved: true,
        // });
        // Pending results count considering `isObserverInPollingUnit`
        const totalUploadResults = await ElectionData.aggregate([
            { $match: { userRole: "observer" } },
            {
                $lookup: {
                    from: "completedusers",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: "$userDetails" },
            {
                $match: {
                    "userDetails.isObserverInPollingUnit": true,
                },
            },
            {
                $count: "totalUploadResults",
            },
        ]);
        const pendingResultsCount = totalUploadResults.length > 0
            ? totalUploadResults[0].totalUploadResults
            : 0;
        const activityBoard = {
            "all the total result submitted": totalResults,
            "all the total result submitted by observer": totalObserverResults,
            "all the total result submitted by volunteer": totalVolunteerResults,
            "all the total approved result": pendingResultsCount,
            // "all the total pending approved result": pendingResultsCount,
        };
        // Fetch the top 10 most recent notifications
        const notifications = await Notification.find({
            $or: [
                { recipients: { $exists: false } },
                { recipients: "all" }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .select("-readBy");
        return { activityBoard, notifications };
    }
    catch (error) {
        throw new Error(`Error fetching activity board and notifications: ${error.message}`);
    }
};
//# sourceMappingURL=electionLive.js.map