import Election from "../../models/Election/Election.js";
import ElectionData from "../../models/Election/ElectionData.js";
import ActiveElection from "../../models/Election/ActiveElection.js";
import CompletedUser from "../../models/CompletedUser.js";
import { politicalParties } from "../../models/Election/PoliticalParty.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import File from "../../models/file.js";
import path from "path";
import moment from "moment";
import AdminLog from "../../models/admin/AdminLog.js";
import { uploadFileToFirebase } from "../../config/firebaseUploader.js";
import bucket from "../../config/firebaseConfig.js";
import { electionNotificationTemplate } from "../../config/emailTemplates.js";
import { sendEmail } from "../../config/email.js";
import { isActiveElectionRelevantForUser } from "../../utils/electionRelevanceForUser.js";
import { isActiveElectionConcluded } from "../../utils/electionNotificationVisibility.js";
import { dispatchMobileNotification, dispatchNotificationToUsers, } from "../mobile/notificationDispatchService.js";
const BACKEND_URL = process.env.BACKEND_URL;
const embedFlagEvidenceFiles = async (files) => {
    const out = {};
    if (files?.flagImage?.[0]) {
        const file = files.flagImage[0];
        const { publicUrl, filePath, token } = await uploadFileToFirebase(file, "flag_evidence_pictures");
        const doc = await File.create({
            location: filePath,
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
            url: publicUrl,
            token,
        });
        out.flagImage = {
            location: doc.location ?? "",
            name: doc.name ?? "",
            type: doc.type ?? "",
            size: typeof doc.size === "number" ? doc.size : 0,
            url: doc.url ?? "",
        };
    }
    if (files?.flagVideo?.[0]) {
        const file = files.flagVideo[0];
        const { publicUrl, filePath, token } = await uploadFileToFirebase(file, "flag_evidence_videos");
        const doc = await File.create({
            location: filePath,
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
            url: publicUrl,
            token,
        });
        out.flagVideo = {
            location: doc.location ?? "",
            name: doc.name ?? "",
            type: doc.type ?? "",
            size: typeof doc.size === "number" ? doc.size : 0,
            url: doc.url ?? "",
        };
    }
    return out;
};
const formatFlagNotificationInfo = (reason, media) => {
    const parts = [];
    const trimmed = reason?.trim();
    if (trimmed)
        parts.push(`Reason: ${trimmed}`);
    if (media.flagImage?.url)
        parts.push(`Image: ${media.flagImage.url}`);
    if (media.flagVideo?.url)
        parts.push(`Video: ${media.flagVideo.url}`);
    return parts.length > 0 ? parts.join(" | ") : "Flagged for review.";
};
const parseUploadLocation = (raw) => {
    if (!raw)
        return undefined;
    let source;
    if (typeof raw === "string") {
        try {
            source = JSON.parse(raw);
        }
        catch (_error) {
            throw new Error("uploadLocation must be a valid JSON object.");
        }
    }
    else {
        source = raw;
    }
    const latitude = Number(source.latitude);
    const longitude = Number(source.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("uploadLocation must include valid latitude and longitude.");
    }
    const accuracy = source.accuracy != null && source.accuracy !== ""
        ? Number(source.accuracy)
        : undefined;
    if (accuracy != null && !Number.isFinite(accuracy)) {
        throw new Error("uploadLocation.accuracy must be a valid number.");
    }
    return {
        latitude,
        longitude,
        address: typeof source.address === "string" && source.address.trim()
            ? source.address.trim()
            : undefined,
        accuracy,
        capturedAt: new Date(),
    };
};
const assertCanManageElectionSubmission = (role) => {
    if (role === "public-viewer") {
        throw new Error("Public viewers cannot upload, edit, or delete election result/incident report.");
    }
};
const assertActiveElectionIsLiveNow = (activeElection) => {
    const now = Date.now();
    const start = activeElection.startDate
        ? new Date(activeElection.startDate).getTime()
        : NaN;
    const end = activeElection.endDate
        ? new Date(activeElection.endDate).getTime()
        : NaN;
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
        throw new Error("Active election dates are invalid.");
    }
    if (now < start || now > end) {
        throw new Error("Submissions are allowed only while the election is live.");
    }
};
export const createElectionService = async (data, adminId) => {
    try {
        const { electionType, electionName } = data;
        // Check if the election already exists
        const existingElection = await Election.findOne({
            electionType,
            electionName,
        });
        if (existingElection) {
            throw new Error("Election already exists");
        }
        // Create new election
        const election = new Election({ electionType, electionName });
        const savedElection = await election.save();
        // Log admin action
        await AdminLog.create({
            admin: adminId,
            action: `Created new election: ${electionName} (${electionType})`,
            timestamp: new Date(),
        });
        return {
            message: "Election created successfully",
            election: savedElection,
        };
    }
    catch (error) {
        throw new Error(`Error creating election: ${error.message}`);
    }
};
export const updateElectionService = async (electionId, data, adminId) => {
    try {
        // Update election
        const updatedElection = await Election.findByIdAndUpdate(electionId, data, {
            new: true,
        });
        if (!updatedElection) {
            throw new Error("Election not found");
        }
        // Log admin action
        await AdminLog.create({
            admin: adminId,
            action: `Updated election: ${updatedElection.electionName} (${updatedElection.electionType})`,
            timestamp: new Date(),
        });
        return { message: "Election updated successfully", updatedElection };
    }
    catch (error) {
        throw new Error(`Error updating election: ${error.message}`);
    }
};
export const activeElections = async (data, adminId) => {
    let { electionId, electionLocation, startDate, endDate, mockElection } = data;
    try {
        const existingElection = await Election.findById(electionId);
        if (!existingElection)
            throw new Error("Election not found");
        const electionType = existingElection.electionType.toLowerCase();
        // Validate election location requirements
        if (["national", "house-of-representatives", "senatorial"].includes(electionType)) {
            electionLocation = null;
        }
        else if (["gubernatorial", "house-of-assembly"].includes(electionType) && !electionLocation) {
            throw new Error("State election requires a valid state name.");
        }
        else if (electionType === "lga" && !electionLocation) {
            throw new Error("LGA election requires a valid LGA name.");
        }
        // Check for duplicates
        const duplicate = await ActiveElection.findOne({ election: electionId, electionLocation, startDate, endDate });
        if (duplicate)
            throw new Error("An election for this location and date range already exists.");
        // Save new active election
        const activeElection = await new ActiveElection({ election: electionId, electionLocation, startDate, endDate, mockElection }).save();
        // Log admin action
        await AdminLog.create({
            admin: adminId,
            action: "Created Active Election",
            details: { electionId, data },
            timestamp: new Date(),
        });
        // Normalize electionLocation as array if provided
        const locations = electionLocation ? (Array.isArray(electionLocation) ? electionLocation : [electionLocation]) : [];
        // Build user query based on election type
        const userQuery = {
            "notifications.email.election": true,
        };
        if (["gubernatorial", "house-of-assembly"].includes(electionType)) {
            userQuery.state = { $in: locations };
        }
        else if (electionType === "lga") {
            userQuery.lga = { $in: locations };
        }
        // console.log("User query would be:", userQuery);
        // Fetch users to notify
        const usersToNotify = await CompletedUser.find(userQuery, "email").lean();
        // console.log("Matched users count:", usersToNotify.length);
        // console.log("Matched users:", usersToNotify);
        const userEmails = usersToNotify.map((useremail) => useremail.email);
        // const userEmails = ["yunusmustapha2@gmail.com"];
        const htmlContent = electionNotificationTemplate(existingElection.electionName, String(startDate), String(endDate));
        const emailPromises = userEmails.map((email) => sendEmail({
            to: email,
            subject: `New Election Live: ${existingElection.electionName}`,
            htmlbody: htmlContent,
        }).catch((err) => {
            console.error(`Failed to send email to ${email}:`, err);
        }));
        await Promise.all(emailPromises);
        await dispatchMobileNotification({
            type: "election-day-alert",
            preferenceKey: "electionDayAlert",
            body: `New election live: ${existingElection.electionName}`,
            info: `${String(startDate)} - ${String(endDate)}`,
            activeElectionId: String(activeElection._id),
            recipients: ["observer", "volunteer", "public-viewer"],
            audienceQuery: ["gubernatorial", "house-of-assembly"].includes(electionType)
                ? { state: { $in: locations } }
                : electionType === "lga"
                    ? { lga: { $in: locations } }
                    : {},
        });
        return {
            message: "Election activated successfully",
            activeElection,
        };
    }
    catch (error) {
        throw new Error(`Error activating election: ${error.message}`);
    }
};
export const updateActiveElections = async (electionId, data, adminId) => {
    try {
        const updatedElection = await ActiveElection.findByIdAndUpdate(electionId, data, { new: true });
        if (!updatedElection) {
            throw new Error("Election not found");
        }
        // Log admin action
        await AdminLog.create({
            admin: adminId,
            action: "Updated active election",
            details: { electionId, data },
            timestamp: new Date(),
        });
        return { message: "Election updated successfully", updatedElection };
    }
    catch (error) {
        throw new Error(`Failed to update election: ${error.message}`);
    }
};
export const deleteElectionService = async (electionId, adminId) => {
    const election = await Election.findByIdAndDelete(electionId);
    if (!election)
        throw new Error("Election not found");
    // Log admin action
    await AdminLog.create({
        admin: adminId,
        action: "Deleted election",
        timestamp: new Date(),
    });
    return { message: "Election deleted successfully" };
};
export const deleteActiveElectionService = async (activeElectionId, adminId) => {
    const activeElection = await ActiveElection.findByIdAndDelete(activeElectionId);
    if (!activeElection)
        throw new Error("Active election not found");
    // Log admin action
    await AdminLog.create({
        admin: adminId,
        action: "Deleted active election",
        timestamp: new Date(),
    });
    return { message: "Active election deleted successfully" };
};
export const getAllActiveElectionsService = async (userId) => {
    const isOwnedByUser = (item) => String(item.user) === String(userId);
    const user = await CompletedUser.findById(userId).lean();
    if (!user)
        throw new Error("User not found");
    // Fetch all active elections with election details
    const activeElections = await ActiveElection.find()
        .populate("election", "electionType electionName")
        .populate("results incidentReports")
        .lean();
    const typedActiveElections = activeElections;
    // If user is admin or super-admin, return all active elections
    if (["admin", "super-admin"].includes(user.role ?? "")) {
        return {
            elections: typedActiveElections.map(({ election, results, incidentReports, ...electionData }) => ({
                electionType: election?.electionType,
                electionName: election?.electionName,
                ...electionData,
                results: results
                    ?.filter(isOwnedByUser)
                    .map(({ _id }) => _id) || [],
                incidentReports: incidentReports
                    ?.filter(isOwnedByUser)
                    .map(({ _id }) => _id) || [],
            })),
        };
    }
    const relevantElections = typedActiveElections.filter(({ election, electionLocation: loc }) => isActiveElectionRelevantForUser(election, loc, user));
    if (relevantElections.length === 0) {
        // console.log("No relevant elections found for user.");
        return { elections: [] };
    }
    // console.log(relevantElections.map((a) => a.results), userId);
    // 67913cb1e560c2fb43cf68af
    return {
        elections: relevantElections.map(({ election, results, incidentReports, ...electionData }) => ({
            electionType: election?.electionType,
            electionName: election?.electionName,
            ...electionData,
            results: results
                ?.filter(isOwnedByUser)
                .map(({ _id }) => _id) || [],
            incidentReports: incidentReports
                ?.filter(isOwnedByUser)
                .map(({ _id }) => _id) || [],
        })),
    };
};
export const getAllElectionTypesService = async (userId) => {
    try {
        const standardizeName = (name) => String(name ?? "")
            .toLowerCase()
            .replace(/[-\s]/g, "_")
            .trim();
        const user = await CompletedUser.findById(userId).lean();
        if (!user)
            throw new Error("User not found");
        console.log(`Fetching elections for user: ${userId}`);
        const userState = standardizeName(user.state);
        const userLGA = standardizeName(user.lga);
        // Fetch all elections safely
        const elections = await Election.find()
            .select("electionType electionName")
            .lean();
        if (!elections || elections.length === 0) {
            console.log("No elections found.");
            return { elections: [] };
        }
        // Filter elections safely
        const relevantElections = elections.filter((election) => {
            if (!election || !election.electionType)
                return false;
            const electionType = election.electionType.toLowerCase();
            if (["national", "house-of-representatives", "senatorial"].includes(electionType)) {
                return true;
            }
            if (["gubernatorial", "house-of-assembly"].includes(electionType)) {
                return userState && userState.length > 0;
            }
            if (["lga"].includes(electionType)) {
                return userLGA && userLGA.length > 0;
            }
            return false;
        });
        console.log("Filtered Elections:", relevantElections);
        return { elections: relevantElections };
    }
    catch (error) {
        console.error("Error fetching elections:", error);
        return { message: "Error fetching elections", error: error.message };
    }
};
export const getElectionResultById = async (electionId, userId) => {
    const activeElection = await ActiveElection.findById(electionId).lean();
    if (!activeElection) {
        throw new Error("Election not found");
    }
    const result = await ElectionData.findOne({
        election: electionId,
        user: userId,
    }).lean();
    const incidentReport = await IncidentReport.findOne({
        election: electionId,
        user: userId,
    }).lean();
    if (result || incidentReport) {
        return { election: activeElection, result, incidentReport };
    }
};
export const getElectionById = async (electionId, userId) => {
    try {
        // Fetch the election data by ID
        const activeElection = await ActiveElection.findById(electionId)
            .populate("election", "electionType electionName")
            .lean();
        if (!activeElection) {
            throw new Error("Election not found");
        }
        // console.log("Election and User:", electionId, userId);
        // Fetch the election result data for the specific user and election
        const result = await ElectionData.findOne({
            election: electionId,
            user: userId,
        }).lean();
        // Fetch the incident report data for the specific user and election
        const incidentReport = await IncidentReport.findOne({
            election: electionId,
            user: userId,
        }).lean();
        // Create the election data object including political parties, results, and incident reports
        const { election, ...electionData } = activeElection;
        const electionRef = election;
        // Include only required data and format political parties properly
        const formattedElectionData = {
            ...electionData,
            electionType: electionRef.electionType,
            electionName: electionRef.electionName,
            politicalParties: politicalParties.map((party) => ({
                name: party.name,
                code: party.code,
                logo: party.imageUrl || null,
            })),
            results: result ? [result] : [],
            incidentReports: incidentReport ? [incidentReport] : [],
        };
        return { election: formattedElectionData };
    }
    catch (error) {
        throw new Error(`Error fetching election data: ${error.message}`);
    }
};
export const getLiveElectionById = async (electionId) => {
    try {
        // Fetch the election data by ID
        const election = await Election.findById(electionId).lean();
        if (!election) {
            throw new Error("Election not found");
        }
        // console.log("election", electionId);
        const activeElection = await ActiveElection.findOne({
            election: electionId,
        }).lean();
        if (!activeElection)
            throw new Error("Active Election not found");
        // Fetch the election result data for the specific election
        const results = await ElectionData.find({ election: electionId }).lean();
        // Fetch the incident report data for the specific election
        const incidentReports = await IncidentReport.find({
            election: electionId,
        }).lean();
        // Create the election data object including both results and incident reports
        const electionData = {
            electionDetails: {
                electiontype: election.electionType,
                electionname: election.electionName,
                startdate: activeElection.startDate,
                enddate: activeElection.endDate,
            },
            results: results.map((result) => ({
                state: result.state,
                lga: result.lga,
                ward: result.ward,
                pollingUnit: result.pollingUnit,
                partiesVotes: result.partiesVotes,
                voteRating: result.voteRating,
                voterIntimidation: result.voterIntimidation,
                voteBuying: result.voteBuying,
            })),
            incidentReports: incidentReports.map((report) => ({
                state: report.state,
                lga: report.lga,
                ward: report.ward,
                pollingUnit: report.pollingUnit,
                selectIncident: report.selectIncident,
                incidentNote: report.incidentNote,
                electionRating: report.electionRating,
            })),
        };
        return { election: electionData };
    }
    catch (error) {
        throw new Error(`Error fetching election data: ${error.message}`);
    }
};
export const uploadResultDataService = async (electionId, userId, data, files) => {
    try {
        let { partiesVotes, voterIntimidation, voteBuying, voteRating, timeBegan, accreditedVoters, rejectedPapers, spoiledBallotPapers, usedBallotPapers, uploadLocation, } = data;
        // Ensure that partiesVotes is properly parsed as JSON
        if (typeof partiesVotes === "string") {
            try {
                partiesVotes = JSON.parse(partiesVotes);
            }
            catch (error) {
                throw new Error("Invalid format for partiesVotes. It should be a JSON array.");
            }
        }
        // Convert accreditedVoters and rejectedPapers to numbers
        accreditedVoters = Number(accreditedVoters);
        rejectedPapers = Number(rejectedPapers);
        spoiledBallotPapers = Number(spoiledBallotPapers);
        usedBallotPapers = Number(usedBallotPapers);
        if (isNaN(accreditedVoters) ||
            isNaN(rejectedPapers) ||
            isNaN(spoiledBallotPapers) ||
            isNaN(usedBallotPapers)) {
            throw new Error("accreditedVoters, rejectedPapers, spoiledBallotPapers, and usedBallotPapers must be valid numbers.");
        }
        // Find the election by its ID
        const activeElection = await ActiveElection.findById(electionId).populate("election", "electionType electionName");
        if (!activeElection) {
            throw new Error("Election not found");
        }
        assertActiveElectionIsLiveNow(activeElection);
        // Find the user by ID
        const user = await CompletedUser.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        assertCanManageElectionSubmission(user.role);
        // Check if the user has already uploaded a result for this election
        const existingResult = await ElectionData.findOne({
            election: electionId,
            user: userId,
        });
        if (existingResult) {
            return existingResult;
        }
        // One-submission-only policy: user can submit either result OR incident for an active election.
        const existingIncident = await IncidentReport.findOne({
            election: electionId,
            user: userId,
        }).select("_id");
        if (existingIncident) {
            throw new Error("You have already submitted an incident report for this election. Only one submission (result or incident) is allowed.");
        }
        const parsedUploadLocation = parseUploadLocation(uploadLocation);
        if (user.role === "observer" && !parsedUploadLocation) {
            throw new Error("Observers must enable and provide upload location before submitting election results.");
        }
        // Convert partiesVotes.count to numbers
        const totalVotes = partiesVotes.reduce((sum, partyVote) => sum + Number(partyVote.count), 0);
        if (spoiledBallotPapers + rejectedPapers + totalVotes !==
            usedBallotPapers) {
            throw new Error("The total of spoiledBallotPapers, rejectedPapers, and totalValidVotes must equal usedBallotPapers.");
        }
        // Validate that accreditedVoters is greater than or equal to usedBallotPapers
        if (accreditedVoters < usedBallotPapers) {
            throw new Error("The number of accreditedVoters cannot be less than the total number of used ballot papers.");
        }
        // Initialize result picture and video
        let resultPicture = null;
        let resultVideo = null;
        // Handle the picture file upload (if provided)
        if (files.resultPicture && files.resultPicture.length > 0) {
            const { publicUrl, filePath, token } = await uploadFileToFirebase(files.resultPicture[0], "result_pictures");
            resultPicture = await File.create({
                location: filePath,
                name: files.resultPicture[0].originalname,
                type: files.resultPicture[0].mimetype,
                size: files.resultPicture[0].size,
                url: publicUrl,
                token,
            });
        }
        // Handle the video file upload (if provided)
        if (files.resultVideo && files.resultVideo.length > 0) {
            const { publicUrl, filePath, token } = await uploadFileToFirebase(files.resultVideo[0], "result_videos");
            resultVideo = await File.create({
                location: filePath,
                name: files.resultVideo[0].originalname,
                type: files.resultVideo[0].mimetype,
                size: files.resultVideo[0].size,
                url: publicUrl,
                token,
            });
        }
        // Validate that both resultPicture and resultVideo are uploaded
        if (user.role === "observer" && !resultVideo) {
            throw new Error("Result video is required for observers.");
        }
        if (!resultPicture) {
            throw new Error("Result picture must be uploaded.");
        }
        // Determine if the result should include "isApproved"
        // let isApproved = null;
        // if (user.role === "observer" && user.isObserverInPollingUnit) {
        //   isApproved = false;
        // }
        // Create the election data document
        const electionData = new ElectionData({
            election: electionId,
            user: userId,
            userRole: user.role,
            state: user.state,
            lga: user.lga,
            ward: user.ward,
            pollingUnit: user.pollingUnit,
            uploadLocation: parsedUploadLocation,
            partiesVotes,
            voterIntimidation,
            voteBuying,
            resultPicture,
            resultVideo,
            voteRating,
            timeBegan,
            accreditedVoters,
            rejectedPapers,
            spoiledBallotPapers,
            usedBallotPapers,
            // ...(isApproved !== null && { isApproved }),
        });
        // Save the election result data
        const savedResultData = await electionData.save();
        // Update the election document with the new result
        activeElection.results.push(savedResultData._id);
        activeElection.resultsCount += 1;
        await activeElection.save();
        // Convert electionType and stateName to Title Case for notifications
        const toTitleCase = (text) => text
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
        const electionRef = activeElection.election;
        const formattedElectionName = toTitleCase(electionRef?.electionName || "Election");
        const formattedStateName = toTitleCase(user.state || "State");
        // Count result uploads
        const resultUploadCount = await ElectionData.countDocuments({ election: electionId });
        const resultText = `${resultUploadCount} ${resultUploadCount === 1 ? "Result uploaded" : "Results uploaded"}`;
        // Determine notification content
        let uploadNotificationBody = "";
        let uploadNotificationInfo = "";
        const electionTypes = electionRef?.electionType?.toLowerCase?.();
        switch (electionTypes) {
            case "national":
                uploadNotificationBody = `${resultText} for ${formattedStateName} State`;
                uploadNotificationInfo = `${formattedElectionName} Election`;
                break;
            case "senatorial":
            case "gubernatorial":
            case "house-of-representatives":
            case "house-of-assembly": {
                const formattedLGAName = toTitleCase(user.lga || "LGA");
                uploadNotificationBody = `${resultText} for ${formattedLGAName} LGA`;
                uploadNotificationInfo = `${formattedStateName} State ${formattedElectionName} Election`;
                break;
            }
            case "lga": {
                const formattedWardName = toTitleCase(user.ward || "Ward");
                uploadNotificationBody = `${resultText} for ${formattedWardName} Ward`;
                uploadNotificationInfo = `${formattedStateName} State ${formattedElectionName} Election`;
                break;
            }
            default:
                uploadNotificationBody = `${resultText} for ${formattedElectionName} Election`;
                uploadNotificationInfo = `${formattedElectionName} Election`;
        }
        await dispatchMobileNotification({
            type: "result-upload",
            preferenceKey: "pollingUnitActivity",
            body: uploadNotificationBody,
            info: uploadNotificationInfo,
            activeElectionId: String(electionId),
            recipients: ["observer", "volunteer", "public-viewer"],
            audienceQuery: {
                state: user.state,
                lga: user.lga,
                ward: user.ward,
                pollingUnit: user.pollingUnit,
            },
        });
        await dispatchMobileNotification({
            type: "result-aggregated",
            preferenceKey: "resultAggregated",
            body: `${formattedElectionName} updates are being aggregated`,
            info: `${formattedStateName} • ${resultText}`,
            activeElectionId: String(electionId),
            recipients: ["observer", "volunteer", "public-viewer"],
            audienceQuery: {
                state: user.state,
                lga: user.lga,
            },
        });
        // Convert to a plain object and remove isApproved if not applicable
        const resultData = savedResultData.toObject();
        // if (isApproved === null) {
        //   delete resultData.isApproved;
        // }
        // Return the saved result data
        return resultData;
    }
    catch (error) {
        console.error("Error saving election data:", error);
        throw new Error(`Error saving election data: ${error.message}`);
    }
};
export const updateResultDataService = async (electionId, userId, data = {}, files = {}) => {
    try {
        let { partiesVotes, voterIntimidation, voteBuying, voteRating, timeBegan, accreditedVoters, rejectedPapers, spoiledBallotPapers, usedBallotPapers, uploadLocation, } = data;
        // Ensure partiesVotes is properly parsed if sent as a string
        if (typeof partiesVotes === "string") {
            try {
                partiesVotes = JSON.parse(partiesVotes);
            }
            catch (error) {
                throw new Error("Invalid format for partiesVotes. It should be a JSON array.");
            }
        }
        // Convert inputs to numbers if provided
        accreditedVoters =
            accreditedVoters !== undefined ? Number(accreditedVoters) : undefined;
        rejectedPapers =
            rejectedPapers !== undefined ? Number(rejectedPapers) : undefined;
        spoiledBallotPapers =
            spoiledBallotPapers !== undefined
                ? Number(spoiledBallotPapers)
                : undefined;
        usedBallotPapers =
            usedBallotPapers !== undefined ? Number(usedBallotPapers) : undefined;
        let parsedPartiesVotes;
        if (typeof partiesVotes === "string") {
            try {
                parsedPartiesVotes = JSON.parse(partiesVotes);
            }
            catch (_error) {
                throw new Error("Invalid format for partiesVotes. It should be a JSON array.");
            }
        }
        else if (Array.isArray(partiesVotes)) {
            parsedPartiesVotes = partiesVotes;
        }
        // Check if the election exists
        const electionExists = await ActiveElection.findById(electionId);
        if (!electionExists) {
            throw new Error("Election not found");
        }
        // Check if the user exists
        const userExists = await CompletedUser.findById(userId);
        if (!userExists) {
            throw new Error("User not found or unauthorized");
        }
        assertCanManageElectionSubmission(userExists.role);
        // Find the result data
        const result = await ElectionData.findOne({
            election: electionId,
            user: userId,
        });
        if (!result) {
            throw new Error("Result data not found or unauthorized");
        }
        const parsedUploadLocation = parseUploadLocation(uploadLocation);
        if (parsedUploadLocation) {
            result.uploadLocation =
                parsedUploadLocation;
        }
        // Validate new logic for ballot papers and votes
        if (partiesVotes ||
            rejectedPapers ||
            spoiledBallotPapers ||
            usedBallotPapers ||
            accreditedVoters) {
            const totalVotes = parsedPartiesVotes
                ? parsedPartiesVotes.reduce((sum, partyVote) => sum + Number(partyVote.count), 0)
                : result.partiesVotes.reduce((sum, partyVote) => sum + Number(partyVote.count), 0);
            const validatedRejectedPapers = Number(rejectedPapers ?? result.rejectedPapers ?? 0);
            const validatedSpoiledBallotPapers = Number(spoiledBallotPapers ?? result.spoiledBallotPapers ?? 0);
            const validatedUsedBallotPapers = Number(usedBallotPapers ?? result.usedBallotPapers ?? 0);
            const validatedAccreditedVoters = Number(accreditedVoters ?? result.accreditedVoters ?? 0);
            // Validate that usedBallotPapers equals spoiled + rejected + totalValidVotes
            if (validatedSpoiledBallotPapers + validatedRejectedPapers + totalVotes !==
                validatedUsedBallotPapers) {
                throw new Error("The total of spoiledBallotPapers, rejectedPapers, and totalValidVotes must equal usedBallotPapers.");
            }
            // Validate that accreditedVoters is greater than or equal to usedBallotPapers
            if (validatedAccreditedVoters < validatedUsedBallotPapers) {
                throw new Error("The number of accreditedVoters cannot be less than the total number of used ballot papers.");
            }
        }
        // Update fields only if they are provided
        result.partiesVotes =
            parsedPartiesVotes !== undefined
                ? parsedPartiesVotes
                : result.partiesVotes;
        result.voterIntimidation =
            voterIntimidation !== undefined
                ? voterIntimidation
                : result.voterIntimidation;
        result.voteBuying =
            voteBuying !== undefined ? voteBuying : result.voteBuying;
        result.voteRating =
            voteRating !== undefined ? voteRating : result.voteRating;
        result.timeBegan = timeBegan !== undefined ? timeBegan : result.timeBegan;
        result.accreditedVoters =
            accreditedVoters !== undefined
                ? accreditedVoters
                : result.accreditedVoters;
        result.rejectedPapers =
            rejectedPapers !== undefined ? rejectedPapers : result.rejectedPapers;
        result.spoiledBallotPapers =
            spoiledBallotPapers !== undefined
                ? spoiledBallotPapers
                : result.spoiledBallotPapers;
        result.usedBallotPapers =
            usedBallotPapers !== undefined
                ? usedBallotPapers
                : result.usedBallotPapers;
        const filePromises = [];
        // Update resultPicture if provided
        if (files.resultPicture && files.resultPicture.length > 0) {
            const nextResultPicture = files.resultPicture;
            filePromises.push((async () => {
                // Delete old Firebase file and DB record if exists
                if (result.resultPicture) {
                    const oldFile = bucket.file(result.resultPicture.location ?? "");
                    const [exists] = await oldFile.exists();
                    if (exists) {
                        await oldFile.delete();
                        // console.log("Deleted old resultPicture from Firebase:", result.resultPicture.location);
                    }
                    await File.deleteOne({
                        _id: result.resultPicture
                            ._id,
                    });
                }
                // Upload new file to Firebase
                const { publicUrl, filePath, token } = await uploadFileToFirebase(nextResultPicture[0], "result_pictures");
                // Create new File document
                const newFile = await File.create({
                    location: filePath,
                    name: nextResultPicture[0].originalname,
                    type: nextResultPicture[0].mimetype,
                    size: nextResultPicture[0].size,
                    url: publicUrl,
                    token,
                });
                // Update result object reference
                result.resultPicture = newFile;
            })());
        }
        // Update resultVideo if provided
        if (files.resultVideo && files.resultVideo.length > 0) {
            const nextResultVideo = files.resultVideo;
            filePromises.push((async () => {
                // Delete old Firebase file and DB record if exists
                if (result.resultVideo) {
                    const oldFile = bucket.file(result.resultVideo.location ?? "");
                    const [exists] = await oldFile.exists();
                    if (exists) {
                        await oldFile.delete();
                        // console.log("Deleted old resultVideo from Firebase:", result.resultVideo.location);
                    }
                    await File.deleteOne({
                        _id: result.resultVideo
                            ._id,
                    });
                }
                // Upload new file to Firebase
                const { publicUrl, filePath, token } = await uploadFileToFirebase(nextResultVideo[0], "result_videos");
                // Create new File document
                const newFile = await File.create({
                    location: filePath,
                    name: nextResultVideo[0].originalname,
                    type: nextResultVideo[0].mimetype,
                    size: nextResultVideo[0].size,
                    url: publicUrl,
                    token,
                });
                // Update result object reference
                result.resultVideo = newFile;
            })());
        }
        // Wait for all file updates to finish
        await Promise.all(filePromises);
        // Save the updated result data
        const updatedResult = await result.save();
        return updatedResult;
    }
    catch (error) {
        throw new Error(`Failed to update result data: ${error.message}`);
    }
};
export const deleteElectionResultDataService = async (electionId, userId) => {
    try {
        // Find the user by ID
        const user = await CompletedUser.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        assertCanManageElectionSubmission(user.role);
        const election = await ActiveElection.findById(electionId).select("endDate");
        if (!election) {
            throw new Error("Election not found");
        }
        const electionIsOver = election.endDate && new Date(election.endDate).getTime() <= Date.now();
        if (user.role === "observer" && electionIsOver) {
            throw new Error("Election is over. Observers cannot delete result data.");
        }
        // Find the result data and ensure it belongs to the requesting user
        const result = await ElectionData.findOneAndDelete({
            election: electionId,
            user: userId,
        });
        if (!result) {
            throw new Error("Result data not found or unauthorized");
        }
        // Update the election to remove the reference to the deleted result
        await ActiveElection.findByIdAndUpdate(electionId, {
            $pull: { results: result._id },
            $inc: { resultsCount: -1 },
        });
        return { message: "Result data deleted successfully" };
    }
    catch (error) {
        throw new Error(`Failed to delete result data: ${error.message}`);
    }
};
export const getUserElectionData = async (userId) => {
    if (!userId) {
        throw new Error("User ID is required.");
    }
    try {
        const electionData = await ElectionData.find({ user: userId }).populate("election");
        if (!electionData || electionData.length === 0) {
            throw new Error("No election data found for the user.");
        }
        // console.log(userId, electionData);
        return electionData;
    }
    catch (error) {
        console.error(`Error fetching election data for user ${userId}:`, error.message);
        throw new Error(`Failed to fetch election data: ${error.message}`);
    }
};
export const getAllElectionResults = async () => {
    try {
        const aggregateIncidents = (incidents) => incidents;
        const aggregateResults = (results) => results;
        const activeElections = await ActiveElection.find()
            .populate("election", "electionType electionName")
            .lean();
        if (!activeElections || activeElections.length === 0) {
            throw new Error("No elections found");
        }
        const allResults = {};
        for (const election of activeElections) {
            const results = await ElectionData.find({
                election: election._id,
            }).lean();
            const incidents = await IncidentReport.find({
                election: election._id,
            }).lean();
            if (!results || results.length === 0) {
                // console.log(`No results found for election ${election._id}`);
                allResults[String(election._id)] = {
                    electionDetails: {
                        electionType: election.election?.electionType,
                        electionName: election.election?.electionName,
                        // startDate: activeElections.electionLocation.startDate,
                        // endDate: activeElections.electionLocation.endDate,
                    },
                    results: [],
                    incidents: aggregateIncidents(incidents) || [],
                };
                continue;
            }
            const aggregatedResults = aggregateResults(results);
            allResults[String(election._id)] = {
                electionDetails: {
                    electionType: election.election?.electionType,
                    electionName: election.election?.electionName,
                    // startDate: activeElections.electionLocation.startDate,
                    // endDate: activeElections.electionLocation.endDate,
                    resultsCount: election.resultsCount,
                },
                results: aggregatedResults,
                incidents: aggregateIncidents(incidents) || [],
            };
        }
        return allResults;
    }
    catch (error) {
        console.error(`Error fetching all election results: ${error.message}`);
        throw new Error(`Error fetching all election results: ${error.message}`);
    }
};
export const uploadIncidentReportDataService = async (electionId, userId, data, files) => {
    try {
        const { selectIncident, incidentNote, electionRating, uploadLocation } = data;
        const normalizedIncidentNote = typeof incidentNote === "string" ? incidentNote.trim() : "";
        if (!selectIncident) {
            throw new Error("selectIncident is required.");
        }
        if (!normalizedIncidentNote) {
            throw new Error("incidentNote is required.");
        }
        // Check election existence
        const activeElection = await ActiveElection.findById(electionId);
        if (!activeElection)
            throw new Error("Election not found");
        assertActiveElectionIsLiveNow(activeElection);
        // Check user existence
        const user = await CompletedUser.findById(userId);
        if (!user)
            throw new Error("User not found");
        assertCanManageElectionSubmission(user.role);
        // Check if incident report exists
        const existingReport = await IncidentReport.findOne({
            election: electionId,
            user: userId,
        });
        if (existingReport)
            return existingReport;
        // One-submission-only policy: user can submit either result OR incident for an active election.
        const existingResult = await ElectionData.findOne({
            election: electionId,
            user: userId,
        }).select("_id");
        if (existingResult) {
            throw new Error("You have already submitted an election result for this election. Only one submission (result or incident) is allowed.");
        }
        const parsedUploadLocation = parseUploadLocation(uploadLocation);
        if (user.role === "observer" && !parsedUploadLocation) {
            throw new Error("Observers must enable and provide upload location before submitting incident reports.");
        }
        const allowedVideoExtensions = [".mp4", ".avi", ".mov", ".webm", ".wmv"];
        const allowedImageExtensions = [".jpg", ".jpeg", ".webp", ".png", ".svg"];
        // Validate file extension
        const validateFile = (file, allowedExtensions) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                throw new Error(`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`);
            }
            return ext;
        };
        // Validate that both incidentPicture and incidentVideo are uploaded
        if ((!files["incidentVideos[]"] || files["incidentVideos[]"].length === 0) ||
            (!files["incidentPictures[]"] || files["incidentPictures[]"].length === 0)) {
            throw new Error("Both incidentPicture and incidentVideo must be uploaded.");
        }
        // Upload and validate incident videos
        const incidentVideoPromises = files["incidentVideos[]"]?.map(async (file) => {
            validateFile(file, allowedVideoExtensions);
            const { publicUrl, filePath, token } = await uploadFileToFirebase(file, "incident_videos");
            return {
                location: filePath,
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                url: publicUrl,
                token,
            };
        }) || [];
        const incidentPicturePromises = files["incidentPictures[]"]?.map(async (file) => {
            validateFile(file, allowedImageExtensions);
            const { publicUrl, filePath, token } = await uploadFileToFirebase(file, "incident_pictures");
            return {
                location: filePath,
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                url: publicUrl,
                token,
            };
        }) || [];
        // Create incident report
        const incidentReport = new IncidentReport({
            election: electionId,
            user: userId,
            userRole: user.role,
            state: user.state,
            lga: user.lga,
            ward: user.ward,
            pollingUnit: user.pollingUnit,
            uploadLocation: parsedUploadLocation,
            selectIncident,
            incidentNote: normalizedIncidentNote,
            electionRating,
            incidentPictures: await Promise.all(incidentPicturePromises),
            incidentVideos: await Promise.all(incidentVideoPromises),
        });
        // Save and return
        const savedReport = await incidentReport.save();
        activeElection.incidentReports.push(savedReport._id);
        await activeElection.save();
        await dispatchMobileNotification({
            type: "incident-upload",
            preferenceKey: "pollingUnitActivity",
            body: `${user.role === "observer" ? "Observer" : "Volunteer"} reported an incident`,
            info: `${user.pollingUnit ?? "Polling Unit"} • ${selectIncident ?? "Incident"}`,
            activeElectionId: String(electionId),
            recipients: ["observer", "volunteer", "public-viewer"],
            audienceQuery: {
                state: user.state,
                lga: user.lga,
                ward: user.ward,
                pollingUnit: user.pollingUnit,
            },
        });
        return savedReport;
    }
    catch (error) {
        console.error("Error uploading incident report data", error);
        throw new Error(`Error saving election incident: ${error.message}`);
    }
};
export const updateIncidentReportDataService = async (electionId, userId, data = {}, files = {}, replaceFiles = false) => {
    try {
        const { selectIncident, incidentNote, electionRating, uploadLocation, keepIncidentVideoIds = [], keepIncidentPictureIds = [], } = data;
        const allowedVideoExtensions = [".mp4", ".avi", ".mov", ".webm", ".wmv"];
        const allowedImageExtensions = [".jpg", ".jpeg", ".webp", ".png", ".svg"];
        const validateFile = (file, allowedExtensions) => {
            const ext = path.extname(file.originalname).toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                throw new Error(`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`);
            }
        };
        const electionExists = await ActiveElection.findById(electionId);
        if (!electionExists)
            throw new Error("Election not found");
        const user = await CompletedUser.findById(userId);
        if (!user)
            throw new Error("User not found");
        assertCanManageElectionSubmission(user.role);
        const report = await IncidentReport.findOne({
            election: electionId,
            user: userId,
        });
        if (!report)
            throw new Error("Incident report not found or unauthorized");
        if (selectIncident != null && String(selectIncident).trim() === "") {
            throw new Error("selectIncident is required.");
        }
        if (incidentNote != null && String(incidentNote).trim() === "") {
            throw new Error("incidentNote is required.");
        }
        const parsedUploadLocation = parseUploadLocation(uploadLocation);
        if (parsedUploadLocation) {
            report.uploadLocation =
                parsedUploadLocation;
        }
        report.selectIncident = selectIncident ?? report.selectIncident;
        report.incidentNote =
            incidentNote != null ? String(incidentNote).trim() : report.incidentNote;
        report.electionRating = electionRating ?? report.electionRating;
        const reportWithMedia = report;
        const deleteUnkeptFiles = async (existingFiles, keepIds = []) => {
            const keep = keepIds.map(String);
            const toDelete = existingFiles.filter((f) => !keep.includes(String(f._id)));
            await Promise.all(toDelete.map(async (file) => {
                const oldFile = bucket.file(file.location);
                const [exists] = await oldFile.exists();
                if (exists)
                    await oldFile.delete();
                await File.deleteOne({ _id: file._id });
            }));
            return existingFiles.filter((f) => keep.includes(String(f._id)));
        };
        // Process incidentPictures
        if (files.incidentPictures && files.incidentPictures.length > 0) {
            let keptPictures = [];
            if (replaceFiles) {
                // Delete all old
                await deleteUnkeptFiles(report.incidentPictures);
            }
            else {
                // Delete only unkept
                keptPictures = await deleteUnkeptFiles(report.incidentPictures, keepIncidentPictureIds);
            }
            const newPictures = await Promise.all(files.incidentPictures.map(async (file) => {
                validateFile(file, allowedImageExtensions);
                const { publicUrl, filePath, token } = await uploadFileToFirebase(file, "incident_pictures");
                return await File.create({
                    location: filePath,
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    url: publicUrl,
                    token,
                });
            }));
            reportWithMedia.incidentPictures = replaceFiles
                ? newPictures
                : [...keptPictures, ...newPictures];
        }
        // Process incidentVideos
        if (files.incidentVideos && files.incidentVideos.length > 0) {
            let keptVideos = [];
            if (replaceFiles) {
                await deleteUnkeptFiles(report.incidentVideos);
            }
            else {
                keptVideos = await deleteUnkeptFiles(report.incidentVideos, keepIncidentVideoIds);
            }
            const newVideos = await Promise.all(files.incidentVideos.map(async (file) => {
                validateFile(file, allowedVideoExtensions);
                const { publicUrl, filePath, token } = await uploadFileToFirebase(file, "incident_videos");
                return await File.create({
                    location: filePath,
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    url: publicUrl,
                    token,
                });
            }));
            reportWithMedia.incidentVideos = replaceFiles
                ? newVideos
                : [...keptVideos, ...newVideos];
        }
        const updatedReport = await report.save();
        return updatedReport;
    }
    catch (error) {
        throw new Error(`Failed to update incident report data: ${error.message}`);
    }
};
export const deleteIncidentReportDataService = async (electionId, userId) => {
    try {
        // Find the user by ID
        const user = await CompletedUser.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        assertCanManageElectionSubmission(user.role);
        const election = await ActiveElection.findById(electionId).select("endDate");
        if (!election) {
            throw new Error("Election not found");
        }
        const electionIsOver = election.endDate && new Date(election.endDate).getTime() <= Date.now();
        if (user.role === "observer" && electionIsOver) {
            throw new Error("Election is over. Observers cannot delete incident reports.");
        }
        // Find the incident report and ensure it belongs to the requesting user
        const incidentReport = await IncidentReport.findOneAndDelete({
            election: electionId,
            user: userId,
        });
        if (!incidentReport) {
            throw new Error("Incident report not found or unauthorized");
        }
        // Update the election to remove the reference to the deleted incident report
        await ActiveElection.findByIdAndUpdate(electionId, {
            $pull: { incidentReports: incidentReport._id },
        });
        return { message: "Incident report deleted successfully" };
    }
    catch (error) {
        throw new Error(`Failed to delete incident report data: ${error.message}`);
    }
};
export const getUserElectionResultsAndReports = async (userId) => {
    try {
        // Confirm that the user exists
        const user = await CompletedUser.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        // Fetch election results by user
        const electionResults = await ElectionData.find({ user: userId })
            .populate({
            path: "election",
            select: "election startDate endDate mockElection electionLocation createdAt updatedAt",
            populate: {
                path: "election",
                select: "electionType electionName",
            },
        })
            .lean();
        // Fetch incident reports by user
        const incidentReports = await IncidentReport.find({ user: userId })
            .populate({
            path: "election",
            select: "election startDate endDate mockElection electionLocation createdAt updatedAt",
            populate: {
                path: "election",
                select: "electionType electionName",
            },
        })
            .lean();
        const formattedElectionResults = electionResults.map((result) => {
            if (!result.election) {
                console.warn(`Election not found for result ID: ${result._id}`);
                return null;
            }
            const e = result.election;
            return {
                ...result,
                election: {
                    _id: e?._id,
                    electionType: e?.election?.electionType,
                    electionName: e?.election?.electionName,
                    startDate: e?.startDate,
                    endDate: e?.endDate,
                    mockElection: e?.mockElection,
                    electionLocation: e?.electionLocation,
                    createdAt: e?.createdAt,
                    updatedAt: e?.updatedAt,
                },
            };
        }).filter(Boolean);
        const formattedIncidentReports = incidentReports.map((incident) => {
            if (!incident.election) {
                console.warn(`Election not found for incident ID: ${incident._id}`);
                return null;
            }
            const e = incident.election;
            return {
                ...incident,
                election: {
                    _id: e?._id,
                    electionType: e?.election?.electionType,
                    electionName: e?.election?.electionName,
                    startDate: e?.startDate,
                    endDate: e?.endDate,
                    mockElection: e?.mockElection,
                    electionLocation: e?.electionLocation,
                    createdAt: e?.createdAt,
                    updatedAt: e?.updatedAt,
                },
            };
        }).filter(Boolean);
        return {
            data: {
                electionResults: formattedElectionResults,
                incidentReports: formattedIncidentReports,
            },
        };
    }
    catch (error) {
        console.error(`Error fetching election results and incident reports: ${error.message}`);
        throw new Error(`Failed to fetch election results and incident reports: ${error.message}`);
    }
};
export const getResultsAndPerformAction = async (userId, actionData, flagMediaFiles, options) => {
    try {
        const requireSamePollingUnit = options?.requireSamePollingUnit !== false;
        const user = await CompletedUser.findById(userId).lean();
        if (!user || !user.pollingUnit) {
            throw new Error("User not found or polling unit is missing");
        }
        if (user.role === "public-viewer") {
            throw new Error("Public viewers cannot agree or flag election results or incidents.");
        }
        const pollingUnit = user.pollingUnit;
        if (!actionData) {
            return await fetchResults(pollingUnit, userId);
        }
        if (!["agree", "flag", "unagree"].includes(actionData.action)) {
            throw new Error("Invalid action. Use agree, flag, or unagree.");
        }
        if (!["election", "incident"].includes(actionData.dataType)) {
            throw new Error("Invalid data type. It must be 'election' or 'incident'.");
        }
        const dataModel = (actionData.dataType === "election"
            ? ElectionData
            : IncidentReport);
        const data = (await dataModel.findById(actionData.electionId));
        if (!data) {
            throw new Error(`${actionData.dataType === "election"
                ? "Election result"
                : "Incident report"} not found`);
        }
        const activeElectionId = data.election ? String(data.election) : undefined;
        if (String(data.user) === String(userId)) {
            throw new Error("You cannot act on your own result or incident.");
        }
        // Web user-action is polling-unit scoped. Mobile collation uses election
        // coverage filters instead (state / LGA / ward).
        if (requireSamePollingUnit &&
            (!data.pollingUnit ||
                String(data.pollingUnit).trim() !== String(pollingUnit).trim())) {
            throw new Error("You can only agree or flag submissions from your polling unit.");
        }
        if (!activeElectionId) {
            throw new Error("Submission is not linked to an active election.");
        }
        const activeElection = await ActiveElection.findById(activeElectionId)
            .populate("election", "electionType electionName")
            .lean();
        if (!activeElection) {
            throw new Error("Active election not found.");
        }
        // Viewing concluded elections is allowed; agree/flag only while live.
        if (isActiveElectionConcluded(activeElection.endDate)) {
            throw new Error("Agree and flag are only allowed while the election is live. You can still view results and incidents.");
        }
        const electionRef = activeElection.election;
        if (!isActiveElectionRelevantForUser(electionRef ?? undefined, activeElection.electionLocation, user)) {
            throw new Error("This election is not available for your location");
        }
        // Flag requires a prior upload so the actor has counter-data. Agree does not.
        let evidenceId;
        if (actionData.action === "flag") {
            const submissionCheck = await checkUserSubmissionStatusForFlag(userId, {
                electionId: actionData.electionId,
                action: "flag",
                dataType: actionData.dataType,
            });
            if (!submissionCheck.hasUploaded || !submissionCheck.evidenceId) {
                throw new Error("You must have submitted a result or incident for this election before you can flag.");
            }
            evidenceId = submissionCheck.evidenceId;
        }
        let flagMediaEmbedded = {};
        if (actionData.action === "flag") {
            if (!actionData.flagReason?.trim()) {
                throw new Error("Flag reason is required when flagging.");
            }
            flagMediaEmbedded = await embedFlagEvidenceFiles(flagMediaFiles);
        }
        const existingActionIndex = data.actions.findIndex((a) => a.userId != null && String(a.userId) === String(userId));
        const existingAction = data.actions[existingActionIndex];
        const wasAlreadyFlaggedByActor = existingAction?.action === "flag";
        const previousFlaggedCount = data.actions.filter((a) => a.action === "flag").length;
        if (existingAction) {
            if (actionData.action === "agree") {
                if (existingAction.action === "agree") {
                    data.actions.splice(existingActionIndex, 1);
                }
                else if (existingAction.action === "flag") {
                    throw new Error("You cannot agree after flagging the result.");
                }
                else {
                    existingAction.action = "agree";
                    if (evidenceId)
                        existingAction.evidenceId = evidenceId;
                    await dispatchNotificationToUsers({
                        type: "report-confirmed",
                        preferenceKey: "reportConfirmed",
                        body: "Your report/result received a confirmation.",
                        info: "Another user agreed with your submission.",
                        activeElectionId,
                        userIds: [String(data.user)],
                    });
                }
            }
            else if (actionData.action === "flag") {
                existingAction.action = "flag";
                existingAction.flagReason = actionData.flagReason.trim();
                if (flagMediaEmbedded.flagImage) {
                    existingAction.flagImage = flagMediaEmbedded.flagImage;
                }
                if (flagMediaEmbedded.flagVideo) {
                    existingAction.flagVideo = flagMediaEmbedded.flagVideo;
                }
                existingAction.evidenceId = evidenceId;
                if (!wasAlreadyFlaggedByActor) {
                    await dispatchNotificationToUsers({
                        type: "report-flagged",
                        preferenceKey: "reportFlagged",
                        body: "Your report/result was flagged for review.",
                        info: formatFlagNotificationInfo(actionData.flagReason, flagMediaEmbedded),
                        activeElectionId,
                        userIds: [String(data.user)],
                    });
                }
            }
            else if (actionData.action === "unagree") {
                if (existingAction.action === "agree") {
                    data.actions.splice(existingActionIndex, 1);
                }
                else {
                    throw new Error("You haven't agreed to this result/report.");
                }
            }
        }
        else {
            if (actionData.action === "unagree") {
                throw new Error("You haven't agreed to this result/report.");
            }
            const newAction = {
                userId,
                action: actionData.action,
            };
            if (evidenceId) {
                newAction.evidenceId = evidenceId;
            }
            if (actionData.action === "flag") {
                newAction.flagReason = actionData.flagReason.trim();
                if (flagMediaEmbedded.flagImage) {
                    newAction.flagImage = flagMediaEmbedded.flagImage;
                }
                if (flagMediaEmbedded.flagVideo) {
                    newAction.flagVideo = flagMediaEmbedded.flagVideo;
                }
                await dispatchNotificationToUsers({
                    type: "report-flagged",
                    preferenceKey: "reportFlagged",
                    body: "Your report/result was flagged for review.",
                    info: formatFlagNotificationInfo(actionData.flagReason, flagMediaEmbedded),
                    activeElectionId,
                    userIds: [String(data.user)],
                });
            }
            else if (actionData.action === "agree") {
                await dispatchNotificationToUsers({
                    type: "report-confirmed",
                    preferenceKey: "reportConfirmed",
                    body: "Your report/result received a confirmation.",
                    info: "Another user agreed with your submission.",
                    activeElectionId,
                    userIds: [String(data.user)],
                });
            }
            data.actions.push(newAction);
        }
        const totalUsersInPollingUnit = await CompletedUser.countDocuments({
            pollingUnit: user.pollingUnit,
            role: { $in: ["observer", "volunteer"] },
        });
        const totalUsers = totalUsersInPollingUnit > 0 ? totalUsersInPollingUnit : 1;
        const flaggedCount = data.actions.filter((a) => a.action === "flag").length;
        const priorityLevel = Math.round((flaggedCount / totalUsers) * 100);
        const previousPriority = Math.round((previousFlaggedCount / totalUsers) * 100);
        if (flaggedCount > 0) {
            data.flagged = true;
            data.priorityLevel = priorityLevel;
        }
        else {
            data.flagged = false;
            data.priorityLevel = 0;
        }
        if (priorityLevel >= 50) {
            data.hidden = true;
            if (previousPriority < 50) {
                await dispatchMobileNotification({
                    type: "security-alert",
                    preferenceKey: "securityAlerts",
                    body: "Result flagged above 50% threshold.",
                    info: `Polling Unit: ${user.pollingUnit}, Priority Level: ${priorityLevel}%`,
                    activeElectionId,
                    recipients: ["admin", "super-admin"],
                });
            }
        }
        else {
            data.hidden = false;
        }
        await data.save();
        return await fetchResults(pollingUnit, userId);
    }
    catch (error) {
        throw new Error(`Error processing action: ${error.message}`);
    }
};
// Helper function to fetch results and reports for a polling unit and specific user
const fetchResults = async (pollingUnit, userId) => {
    const approvedObservers = await CompletedUser.find({ role: "observer", isObserverInPollingUnit: true }, "_id").lean();
    const approvedObserverIds = approvedObservers.map((u) => u._id);
    const electionResults = await ElectionData.find({
        pollingUnit,
        userRole: "observer",
        user: { $in: approvedObserverIds },
        hidden: false,
    })
        .populate({
        path: "election",
        populate: {
            path: "election",
            select: "electionType electionName",
        },
        select: "startDate endDate electionLocation mockElection",
    })
        .lean();
    const incidentReports = await IncidentReport.find({
        pollingUnit,
        userRole: "observer",
        user: { $in: approvedObserverIds },
        hidden: false,
    })
        .populate({
        path: "election",
        populate: {
            path: "election",
            select: "electionType electionName",
        },
        select: "startDate endDate electionLocation mockElection",
    })
        .lean();
    // Process election results
    const resultData = electionResults.map((result) => {
        const e = result.election;
        const userAction = result.actions.find((a) => String(a.userId) === String(userId));
        return {
            electionTypeId: e?._id,
            electionId: result._id,
            electionType: e?.election?.electionType,
            electionName: e?.election?.electionName,
            pollingUnit: result.pollingUnit,
            electionYear: e
                ? moment(e?.startDate).format("YYYY")
                : "N/A",
            uploadedAt: result.createdAt,
            partiesVotes: result.partiesVotes,
            voteRating: result.voteRating,
            voterIntimidation: result.voterIntimidation,
            voteBuying: result.voteBuying,
            resultPicture: result.resultPicture,
            resultVideo: result.resultVideo,
            agreed: userAction ? userAction.action === "agree" : false,
            flagged: userAction ? userAction.action === "flag" : false,
            hidden: result.hidden,
            priorityLevel: result.priorityLevel,
            actions: result.actions,
            timeBegan: result.timeBegan,
            isApproved: result.isApproved,
            election: result.election,
            electionLocation: e?.electionLocation,
            startDate: e?.startDate || null,
            endDate: e?.endDate || null,
        };
    });
    // Process incident reports
    const reportData = incidentReports.map((report) => {
        const e = report.election;
        const userAction = report.actions.find((a) => String(a.userId) === String(userId));
        return {
            electionTypeId: e?._id,
            electionId: report._id,
            electionType: e?.election?.electionType,
            electionName: e?.election?.electionName,
            electionYear: e
                ? moment(e.startDate).format("YYYY")
                : "N/A",
            pollingUnit: report.pollingUnit,
            uploadedAt: report.createdAt,
            selectIncident: report.selectIncident,
            incidentNote: report.incidentNote,
            electionRating: report.electionRating,
            incidentPictures: report.incidentPictures,
            incidentVideos: report.incidentVideos,
            agreed: userAction ? userAction.action === "agree" : false,
            flagged: userAction ? userAction.action === "flag" : false,
            hidden: report.hidden,
            priorityLevel: report.priorityLevel,
            actions: report.actions,
            electionLocation: e?.electionLocation,
            startDate: e?.startDate || null,
            endDate: e?.endDate || null,
            election: report.election,
        };
    });
    return {
        results: resultData,
        incidentReports: reportData,
    };
};
export const checkUserSubmissionStatusForFlag = async (userId, actionData) => {
    const { electionId, action, dataType } = actionData;
    // Validate that action is "flag" and dataType is either "election" or "incident"
    if (action !== "flag") {
        throw new Error("Action must be 'flag' to check submission status.");
    }
    if (!["election", "incident"].includes(dataType)) {
        throw new Error("Invalid data type. It must be 'election' or 'incident'.");
    }
    // Fetch the election ID for the main election from the provided dataType and electionId
    let mainElectionId;
    if (dataType === "election") {
        const electionResult = await ElectionData.findById(electionId).lean();
        if (!electionResult) {
            throw new Error("Election result not found.");
        }
        mainElectionId = electionResult.election;
    }
    else if (dataType === "incident") {
        const incidentReport = await IncidentReport.findById(electionId).lean();
        if (!incidentReport) {
            throw new Error("Incident report not found.");
        }
        mainElectionId = incidentReport.election;
    }
    // Check if the user has submitted either an election result or an incident report for the specific election
    const electionSubmission = await ElectionData.findOne({
        user: userId,
        election: mainElectionId,
    }).lean();
    const incidentSubmission = await IncidentReport.findOne({
        user: userId,
        election: mainElectionId,
    }).lean();
    // If user has a submission, return its ID as `evidenceId`
    if (electionSubmission) {
        return { hasUploaded: true, evidenceId: electionSubmission._id };
    }
    else if (incidentSubmission) {
        return { hasUploaded: true, evidenceId: incidentSubmission._id };
    }
    return { hasUploaded: false };
};
//# sourceMappingURL=electionService.js.map