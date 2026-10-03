import Election from "../../models/Election/Election.ts";
import ElectionData from "../../models/Election/ElectionData.ts";
import ActiveElection from "../../models/Election/ActiveElection.ts";
import CompletedUser from "../../models/CompletedUser.ts";
import { politicalParties } from "../../models/Election/PoliticalParty.ts";
import IncidentReport from "../../models/Election/IncidentReport.ts";
import File from "../../models/file.ts";
import path from "path";
import moment from "moment";
import AdminLog from "../../models/admin/AdminLog.ts";
import { uploadFileToFirebase } from "../../config/firebaseUploader.ts";
import bucket from "../../config/firebaseConfig.ts";
import { electionNotificationTemplate } from "../../config/emailTemplates.ts";
import { sendEmail } from "../../config/email.ts";
import type { Types } from "mongoose";
import { isActiveElectionRelevantForUser } from "../../utils/electionRelevanceForUser.ts";
import { isActiveElectionConcluded } from "../../utils/electionNotificationVisibility.ts";
import {
  dispatchMobileNotification,
  dispatchNotificationToUsers,
} from "../mobile/notificationDispatchService.ts";
import { invalidateAllMobileReadCaches } from "../../utils/cache.ts";

const BACKEND_URL = process.env.BACKEND_URL;

type Id = Types.ObjectId | string;

/**
 * Source of truth for ActiveElection.resultsCount:
 * count of ElectionData docs for that active election.
 * Also prunes stale ObjectIds from the `results` array.
 */
export const syncActiveElectionResultsCount = async (
  activeElectionId: Id | null | undefined
): Promise<number> => {
  if (!activeElectionId) return 0;

  const [actualCount, resultIds] = await Promise.all([
    ElectionData.countDocuments({ election: activeElectionId }),
    ElectionData.find({ election: activeElectionId }).distinct("_id"),
  ]);

  await ActiveElection.findByIdAndUpdate(activeElectionId, {
    $set: {
      results: resultIds,
      resultsCount: Math.max(0, actualCount),
    },
  });

  return Math.max(0, actualCount);
};

/** Keep ActiveElection.results / resultsCount in sync after a result is deleted. */
export const detachResultFromActiveElection = async (
  activeElectionId: Id | null | undefined,
  resultId: Id
): Promise<void> => {
  if (!activeElectionId) return;
  await ActiveElection.findByIdAndUpdate(activeElectionId, {
    $pull: { results: resultId },
  });
  await syncActiveElectionResultsCount(activeElectionId);
  await invalidateAllMobileReadCaches();
};

/** Rebuild ActiveElection.incidentReports from real IncidentReport docs. */
export const syncActiveElectionIncidentRefs = async (
  activeElectionId: Id | null | undefined
): Promise<number> => {
  if (!activeElectionId) return 0;
  const incidentIds = await IncidentReport.find({
    election: activeElectionId,
  }).distinct("_id");
  await ActiveElection.findByIdAndUpdate(activeElectionId, {
    $set: { incidentReports: incidentIds },
  });
  return incidentIds.length;
};

/** Keep ActiveElection.incidentReports in sync after an incident is deleted. */
export const detachIncidentFromActiveElection = async (
  activeElectionId: Id | null | undefined,
  incidentId: Id
): Promise<void> => {
  if (!activeElectionId) return;
  await ActiveElection.findByIdAndUpdate(activeElectionId, {
    $pull: { incidentReports: incidentId },
  });
  await syncActiveElectionIncidentRefs(activeElectionId);
  await invalidateAllMobileReadCaches();
};

/** Bulk-detach many result/incident ids grouped by active election. */
export const detachSubmissionsFromActiveElections = async (input: {
  results?: Array<{ _id: Id; election?: Id | null }>;
  incidents?: Array<{ _id: Id; election?: Id | null }>;
}): Promise<void> => {
  const resultsByElection = new Map<string, Id[]>();
  for (const row of input.results ?? []) {
    if (!row.election) continue;
    const key = String(row.election);
    const list = resultsByElection.get(key) ?? [];
    list.push(row._id);
    resultsByElection.set(key, list);
  }
  for (const [electionId, ids] of resultsByElection) {
    await ActiveElection.findByIdAndUpdate(electionId, {
      $pull: { results: { $in: ids } },
    });
    await syncActiveElectionResultsCount(electionId);
  }

  const incidentsByElection = new Map<string, Id[]>();
  for (const row of input.incidents ?? []) {
    if (!row.election) continue;
    const key = String(row.election);
    const list = incidentsByElection.get(key) ?? [];
    list.push(row._id);
    incidentsByElection.set(key, list);
  }
  for (const [electionId, ids] of incidentsByElection) {
    await ActiveElection.findByIdAndUpdate(electionId, {
      $pull: { incidentReports: { $in: ids } },
    });
    await syncActiveElectionIncidentRefs(electionId);
  }

  if (resultsByElection.size > 0 || incidentsByElection.size > 0) {
    await invalidateAllMobileReadCaches();
  }
};

type MulterMemoryFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

export type FlagMediaFiles = {
  flagImage?: MulterMemoryFile[];
  flagVideo?: MulterMemoryFile[];
};

type EmbeddedFlagFile = {
  location?: string;
  name?: string;
  type?: string;
  size?: number;
  url?: string;
};

const embedFlagEvidenceFiles = async (
  files?: FlagMediaFiles
): Promise<{ flagImage?: EmbeddedFlagFile; flagVideo?: EmbeddedFlagFile }> => {
  const out: { flagImage?: EmbeddedFlagFile; flagVideo?: EmbeddedFlagFile } = {};
  if (files?.flagImage?.[0]) {
    const file = files.flagImage[0];
    const { publicUrl, filePath, token } = await uploadFileToFirebase(
      file,
      "flag_evidence_pictures"
    );
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
    const { publicUrl, filePath, token } = await uploadFileToFirebase(
      file,
      "flag_evidence_videos"
    );
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

const formatFlagNotificationInfo = (
  reason: string | undefined,
  media: { flagImage?: EmbeddedFlagFile; flagVideo?: EmbeddedFlagFile }
): string => {
  const parts: string[] = [];
  const trimmed = reason?.trim();
  if (trimmed) parts.push(`Reason: ${trimmed}`);
  if (media.flagImage) parts.push("Photo evidence attached");
  if (media.flagVideo) parts.push("Video evidence attached");
  return parts.length > 0 ? parts.join(". ") : "Flagged for review.";
};

type ElectionResultUploadFiles = {
  resultPicture?: MulterMemoryFile[];
  resultVideo?: MulterMemoryFile[];
};

type IncidentReportUploadLike = Partial<
  Record<
    | "incidentPictures"
    | "incidentVideos"
    | "incidentPictures[]"
    | "incidentVideos[]",
    MulterMemoryFile[]
  >
>;

type CreateElectionInput = {
  electionType: string;
  electionName: string;
};

type ActivateElectionInput = {
  electionId: Id;
  electionLocation?: string | string[] | null;
  startDate: Date | string;
  endDate: Date | string;
  mockElection?: boolean;
};

/** Multipart/JSON body; validated in-service before persisting */
type UploadResultPayload = {
  partiesVotes?:
    | string
    | Array<{ party?: string | null; count?: number | string | null }>;
  voterIntimidation?: "yes" | "no" | null | undefined;
  voteBuying?: "yes" | "no" | null | undefined;
  voteRating?: "good" | "okay" | "poor" | null | undefined;
  timeBegan?: string | null | undefined;
  accreditedVoters?: number | string | null | undefined;
  rejectedPapers?: number | string | null | undefined;
  spoiledBallotPapers?: number | string | null | undefined;
  usedBallotPapers?: number | string | null | undefined;
  uploadLocation?:
    | string
    | {
        latitude?: number | string | null;
        longitude?: number | string | null;
        address?: string | null;
        accuracy?: number | string | null;
      };
};

type IncidentReportBody = {
  selectIncident?:
    | "Ballot Stuffing"
    | "Thuggery & Violence"
    | "Underage Voting"
    | "INEC Misconduct"
    | "Result Alteration"
    | "Voter Intimidation"
    | "Late Opening"
    | "Missing Materials"
    | "Other Incidents"
    // Legacy web values
    | "Thuggery and Violence"
    | "Lack of electoral materials"
    | "Fraudulent electoral officers"
    | "Late commencement"
    | "Over voting"
    | "Other"
    | null
    | undefined;
  incidentNote?: string | null | undefined;
  electionRating?: string | null | undefined;
  uploadLocation?:
    | string
    | {
        latitude?: number | string | null;
        longitude?: number | string | null;
        address?: string | null;
        accuracy?: number | string | null;
      };
  keepIncidentVideoIds?: Array<Types.ObjectId | string>;
  keepIncidentPictureIds?: Array<Types.ObjectId | string>;
};

type PollingUnitActionPayload = {
  dataType: "election" | "incident";
  electionId: Id;
  action: "agree" | "flag" | "unagree" | "unflag";
  /** Required when `action` is `flag` (trimmed non-empty). */
  flagReason?: string;
  evidenceId?: string;
};

type FlagSubmissionCheckPayload = {
  electionId: Id;
  action: string;
  dataType: string;
};

type ParsedUploadLocation = {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  capturedAt: Date;
};

const parseUploadLocation = (
  raw: UploadResultPayload["uploadLocation"] | IncidentReportBody["uploadLocation"]
): ParsedUploadLocation | undefined => {
  if (!raw) return undefined;

  let source:
    | {
        latitude?: number | string | null;
        longitude?: number | string | null;
        address?: string | null;
        accuracy?: number | string | null;
      }
    | undefined;
  if (typeof raw === "string") {
    try {
      source = JSON.parse(raw) as {
        latitude?: number | string | null;
        longitude?: number | string | null;
        address?: string | null;
        accuracy?: number | string | null;
      };
    } catch (_error) {
      throw new Error("uploadLocation must be a valid JSON object.");
    }
  } else {
    source = raw;
  }

  const latitude = Number(source.latitude);
  const longitude = Number(source.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("uploadLocation must include valid latitude and longitude.");
  }

  const accuracy =
    source.accuracy != null && source.accuracy !== ""
      ? Number(source.accuracy)
      : undefined;
  if (accuracy != null && !Number.isFinite(accuracy)) {
    throw new Error("uploadLocation.accuracy must be a valid number.");
  }

  return {
    latitude,
    longitude,
    address:
      typeof source.address === "string" && source.address.trim()
        ? source.address.trim()
        : undefined,
    accuracy,
    capturedAt: new Date(),
  };
};

const assertCanManageElectionSubmission = (role: string | null | undefined) => {
  if (role === "public-viewer") {
    throw new Error(
      "Public viewers cannot upload, edit, or delete election result/incident report."
    );
  }
};

const assertActiveElectionIsLiveNow = (activeElection: {
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}) => {
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


export const createElectionService = async (
  data: CreateElectionInput,
  adminId: Id
) => {
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
  } catch (error) {
    throw new Error(`Error creating election: ${error.message}`);
  }
};


export const updateElectionService = async (
  electionId: Id,
  data: Record<string, unknown>,
  adminId: Id
) => {
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
  } catch (error) {
    throw new Error(`Error updating election: ${error.message}`);
  }
};



export const activeElections = async (
  data: ActivateElectionInput,
  adminId: Id
) => {
  let { electionId, electionLocation, startDate, endDate, mockElection } = data;

  try {
    const existingElection = await Election.findById(electionId);
    if (!existingElection) throw new Error("Election not found");

    const electionType = existingElection.electionType.toLowerCase();

    // Validate election location requirements
    if (["national", "house-of-representatives", "senatorial"].includes(electionType)) {
      electionLocation = null;
    } else if (["gubernatorial", "house-of-assembly"].includes(electionType) && !electionLocation) {
      throw new Error("State election requires a valid state name.");
    } else if (electionType === "lga" && !electionLocation) {
      throw new Error("LGA election requires a valid LGA name.");
    }

    // Check for duplicates
    const duplicate = await ActiveElection.findOne({ election: electionId, electionLocation, startDate, endDate });
    if (duplicate) throw new Error("An election for this location and date range already exists.");

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
    const userQuery: Record<string, unknown> = {
      "notifications.email.election": true,
    };

    if (["gubernatorial", "house-of-assembly"].includes(electionType)) {
      userQuery.state = { $in: locations };
    } else if (electionType === "lga") {
      userQuery.lga = { $in: locations };
    }
    // console.log("User query would be:", userQuery);
    // Fetch users to notify
    const usersToNotify = await CompletedUser.find(userQuery, "email").lean();

    // console.log("Matched users count:", usersToNotify.length);
  // console.log("Matched users:", usersToNotify);

 


    const userEmails = usersToNotify.map((useremail) => useremail.email);
    // const userEmails = ["yunusmustapha2@gmail.com"];

    const htmlContent = electionNotificationTemplate(
      existingElection.electionName,
      String(startDate),
      String(endDate)
    );

    const emailPromises = userEmails.map((email) =>
      sendEmail({
        to: email,
        subject: `New Election Live: ${existingElection.electionName}`,
        htmlbody: htmlContent,
      }).catch((err) => {
        console.error(`Failed to send email to ${email}:`, err);
      })
    );

    await Promise.all(emailPromises);

    await dispatchMobileNotification({
      type: "election-day-alert",
      preferenceKey: "electionDayAlert",
      body: `New election live: ${existingElection.electionName}`,
      info: `${String(startDate)} - ${String(endDate)}`,
      activeElectionId: String(activeElection._id),
      recipients: ["observer", "volunteer", "public-viewer"],
      audienceQuery:
        ["gubernatorial", "house-of-assembly"].includes(electionType)
          ? { state: { $in: locations } }
          : electionType === "lga"
            ? { lga: { $in: locations } }
            : {},
    });

    return {
      message: "Election activated successfully",
      activeElection,
    };
  } catch (error) {
    throw new Error(`Error activating election: ${error.message}`);
  }
};

export const updateActiveElections = async (
  electionId: Id,
  data: Record<string, unknown>,
  adminId: Id
) => {
  try {
    const updatedElection = await ActiveElection.findByIdAndUpdate(
      electionId,
      data,
      { new: true }
    );

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
  } catch (error) {
    throw new Error(`Failed to update election: ${error.message}`);
  }
};

export const deleteElectionService = async (electionId: Id, adminId: Id) => {
  const election = await Election.findByIdAndDelete(electionId);
  if (!election) throw new Error("Election not found");

  // Log admin action
 await AdminLog.create({
   admin: adminId,
   action: "Deleted election",
   timestamp: new Date(),
 });

  return { message: "Election deleted successfully" };
};

export const deleteActiveElectionService = async (
  activeElectionId: Id,
  adminId: Id
) => {
  const activeElection = await ActiveElection.findByIdAndDelete(
    activeElectionId
  );
  if (!activeElection) throw new Error("Active election not found");

  // Log admin action
 await AdminLog.create({
   admin: adminId,
   action: "Deleted active election",
   timestamp: new Date(),
 });

  return { message: "Active election deleted successfully" };
};

export const getAllActiveElectionsService = async (userId: Id) => {
  type UserOwnedRef = { _id: Types.ObjectId | string; user: Types.ObjectId | string };
  type ElectionLite = { electionType?: string; electionName?: string };
  type ActiveElectionListItem = {
    election?: ElectionLite | null;
    results?: UserOwnedRef[];
    incidentReports?: UserOwnedRef[];
    electionLocation?: unknown;
    [key: string]: unknown;
  };

  const isOwnedByUser = (item: UserOwnedRef) =>
    String(item.user) === String(userId);

  const user = await CompletedUser.findById(userId).lean();
  if (!user) throw new Error("User not found");

  // Fetch all active elections with election details
  const activeElections = await ActiveElection.find()
    .populate("election", "electionType electionName")
    .populate("results incidentReports")
    .lean();
  const typedActiveElections =
    activeElections as unknown as ActiveElectionListItem[];

      // If user is admin or super-admin, return all active elections
  if (["admin", "super-admin"].includes(user.role ?? "")) {
    return {
      elections: typedActiveElections.map(
        ({
          election,
          results,
          incidentReports,
          ...electionData
        }: ActiveElectionListItem) => ({
          electionType: election?.electionType,
          electionName: election?.electionName,
          ...electionData,
          results:
            results
              ?.filter(isOwnedByUser)
              .map(({ _id }) => _id) || [],
          incidentReports:
            incidentReports
              ?.filter(isOwnedByUser)
              .map(({ _id }) => _id) || [],
        })
      ),
    };
  }

  const relevantElections = typedActiveElections.filter(
    ({ election, electionLocation: loc }: ActiveElectionListItem) =>
      isActiveElectionRelevantForUser(election, loc, user)
  );

  if (relevantElections.length === 0) {
    // console.log("No relevant elections found for user.");
    return { elections: [] };
  }
  // console.log(relevantElections.map((a) => a.results), userId);
  // 67913cb1e560c2fb43cf68af

  return {
    elections: relevantElections.map(
      ({
        election,
        results,
        incidentReports,
        ...electionData
      }: ActiveElectionListItem) => ({
        electionType: election?.electionType,
        electionName: election?.electionName,
        ...electionData,
        results:
          results
            ?.filter(isOwnedByUser)
            .map(({ _id }) => _id) || [],
        incidentReports:
          incidentReports
            ?.filter(isOwnedByUser)
            .map(({ _id }) => _id) || [],
      })
    ),
  };
};



export const getAllElectionTypesService = async (userId: Id) => {
  try {
    const standardizeName = (name: unknown) =>
      String(name ?? "")
        .toLowerCase()
        .replace(/[-\s]/g, "_")
        .trim();

    const user = await CompletedUser.findById(userId).lean();
    if (!user) throw new Error("User not found");

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
      if (!election || !election.electionType) return false;

      const electionType = election.electionType.toLowerCase();

      if (
        ["national", "house-of-representatives", "senatorial"].includes(
          electionType
        )
      ) {
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
  } catch (error) {
    console.error("Error fetching elections:", error);
    return { message: "Error fetching elections", error: error.message };
  }
};

export const getElectionResultById = async (electionId: Id, userId: Id) => {
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

export const getElectionById = async (electionId: Id, userId: Id) => {
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
    const electionRef = election as unknown as {
      electionType?: string;
      electionName?: string;
    };

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
  } catch (error) {
    throw new Error(`Error fetching election data: ${error.message}`);
  }
};

export const getLiveElectionById = async (electionId: Id) => {
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
    if (!activeElection) throw new Error("Active Election not found");

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
  } catch (error) {
    throw new Error(`Error fetching election data: ${error.message}`);
  }
};

export const uploadResultDataService = async (
  electionId: Id,
  userId: Id,
  data: UploadResultPayload,
  files: ElectionResultUploadFiles,
  options?: { requireObserverUploadLocation?: boolean }
) => {
  try {
    let {
      partiesVotes,
      voterIntimidation,
      voteBuying,
      voteRating,
      timeBegan,
      accreditedVoters,
      rejectedPapers,
      spoiledBallotPapers,
      usedBallotPapers,
      uploadLocation,
    } = data;

    // Ensure that partiesVotes is properly parsed as JSON
    if (typeof partiesVotes === "string") {
      try {
        partiesVotes = JSON.parse(partiesVotes);
      } catch (error) {
        throw new Error(
          "Invalid format for partiesVotes. It should be a JSON array."
        );
      }
    }

    // Convert accreditedVoters and rejectedPapers to numbers
    accreditedVoters = Number(accreditedVoters);
    rejectedPapers = Number(rejectedPapers);
    spoiledBallotPapers = Number(spoiledBallotPapers);
    usedBallotPapers = Number(usedBallotPapers);

    if (
      isNaN(accreditedVoters) ||
      isNaN(rejectedPapers) ||
      isNaN(spoiledBallotPapers) ||
      isNaN(usedBallotPapers)
    ) {
      throw new Error(
        "accreditedVoters, rejectedPapers, spoiledBallotPapers, and usedBallotPapers must be valid numbers."
      );
    }

    // Find the election by its ID
    const activeElection = await ActiveElection.findById(electionId).populate(
      "election",
      "electionType electionName"
    );
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
      throw new Error(
        "You have already submitted an incident report for this election. Only one submission (result or incident) is allowed."
      );
    }

    const parsedUploadLocation = parseUploadLocation(uploadLocation);
    const requireObserverUploadLocation =
      options?.requireObserverUploadLocation !== false;
    if (
      requireObserverUploadLocation &&
      user.role === "observer" &&
      !parsedUploadLocation
    ) {
      throw new Error(
        "Observers must enable and provide upload location before submitting election results."
      );
    }

    // Convert partiesVotes.count to numbers
    const totalVotes = (partiesVotes as Array<{ count: unknown }>).reduce(
      (sum: number, partyVote) => sum + Number(partyVote.count),
      0
    );

    if (
      spoiledBallotPapers + rejectedPapers + totalVotes !==
      usedBallotPapers
    ) {
      throw new Error(
        "The total of spoiledBallotPapers, rejectedPapers, and totalValidVotes must equal usedBallotPapers."
      );
    }

    // Validate that accreditedVoters is greater than or equal to usedBallotPapers
    if (accreditedVoters < usedBallotPapers) {
      throw new Error(
        "The number of accreditedVoters cannot be less than the total number of used ballot papers."
      );
    }

    // Initialize result picture and video

    let resultPicture = null;
    let resultVideo = null;
    
    // Handle the picture file upload (if provided)
    if (files.resultPicture && files.resultPicture.length > 0) {
      const { publicUrl, filePath, token } = await uploadFileToFirebase(
        files.resultPicture[0],
        "result_pictures"
      );
    
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
      const { publicUrl, filePath, token } = await uploadFileToFirebase(
        files.resultVideo[0],
        "result_videos"
      );
    
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

    // Rebuild results[] + resultsCount from ElectionData (avoids stale array /
    // concurrent-upload races from read-modify-write on ActiveElection).
    await syncActiveElectionResultsCount(electionId);
    await invalidateAllMobileReadCaches();

    // Convert electionType and stateName to Title Case for notifications
    const toTitleCase = (text: string) =>
      text
        .split("-")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

    const electionRef = activeElection.election as unknown as {
      electionName?: string;
      electionType?: string;
    };

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
  } catch (error) {
    console.error("Error saving election data:", error);
    throw new Error(`Error saving election data: ${error.message}`);
  }
};

export const updateResultDataService = async (
  electionId: Id,
  userId: Id,
  data: UploadResultPayload = {},
  files: ElectionResultUploadFiles = {}
) => {
  try {
    let {
      partiesVotes,
      voterIntimidation,
      voteBuying,
      voteRating,
      timeBegan,
      accreditedVoters,
      rejectedPapers,
      spoiledBallotPapers,
      usedBallotPapers,
      uploadLocation,
    } = data;

    // Ensure partiesVotes is properly parsed if sent as a string
    if (typeof partiesVotes === "string") {
      try {
        partiesVotes = JSON.parse(partiesVotes);
      } catch (error) {
        throw new Error(
          "Invalid format for partiesVotes. It should be a JSON array."
        );
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

    let parsedPartiesVotes:
      | Array<{ party?: string | null; count?: number | string | null }>
      | undefined;
    if (typeof partiesVotes === "string") {
      try {
        parsedPartiesVotes = JSON.parse(partiesVotes) as Array<{
          party?: string | null;
          count?: number | string | null;
        }>;
      } catch (_error) {
        throw new Error(
          "Invalid format for partiesVotes. It should be a JSON array."
        );
      }
    } else if (Array.isArray(partiesVotes)) {
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
      (result as unknown as { uploadLocation?: ParsedUploadLocation }).uploadLocation =
        parsedUploadLocation;
    }

    // Validate new logic for ballot papers and votes
    if (
      partiesVotes ||
      rejectedPapers ||
      spoiledBallotPapers ||
      usedBallotPapers ||
      accreditedVoters
    ) {
      const totalVotes = parsedPartiesVotes
        ? parsedPartiesVotes.reduce(
            (sum: number, partyVote) => sum + Number(partyVote.count),
            0
          )
        : (result.partiesVotes as Array<{ count: number }>).reduce(
            (sum: number, partyVote) => sum + Number(partyVote.count),
            0
          );

      const validatedRejectedPapers = Number(
        rejectedPapers ?? result.rejectedPapers ?? 0
      );
      const validatedSpoiledBallotPapers = Number(
        spoiledBallotPapers ?? result.spoiledBallotPapers ?? 0
      );
      const validatedUsedBallotPapers = Number(
        usedBallotPapers ?? result.usedBallotPapers ?? 0
      );
      const validatedAccreditedVoters = Number(
        accreditedVoters ?? result.accreditedVoters ?? 0
      );

      // Validate that usedBallotPapers equals spoiled + rejected + totalValidVotes
      if (
        validatedSpoiledBallotPapers + validatedRejectedPapers + totalVotes !==
        validatedUsedBallotPapers
      ) {
        throw new Error(
          "The total of spoiledBallotPapers, rejectedPapers, and totalValidVotes must equal usedBallotPapers."
        );
      }

      // Validate that accreditedVoters is greater than or equal to usedBallotPapers
      if (validatedAccreditedVoters < validatedUsedBallotPapers) {
        throw new Error(
          "The number of accreditedVoters cannot be less than the total number of used ballot papers."
        );
      }
    }

    // Update fields only if they are provided
    result.partiesVotes =
      parsedPartiesVotes !== undefined
        ? (parsedPartiesVotes as unknown as typeof result.partiesVotes)
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
          filePromises.push(
            (async () => {
              // Delete old Firebase file and DB record if exists
              if (result.resultPicture) {
                const oldFile = bucket.file(result.resultPicture.location ?? "");
                const [exists] = await oldFile.exists();
                if (exists) {
                  await oldFile.delete();
                  // console.log("Deleted old resultPicture from Firebase:", result.resultPicture.location);
                }
                await File.deleteOne({
                  _id: (result.resultPicture as unknown as { _id: Types.ObjectId })
                    ._id,
                });
              }
        
              // Upload new file to Firebase
              const { publicUrl, filePath, token } = await uploadFileToFirebase(
                nextResultPicture[0],
                "result_pictures"
              );
        
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
            })()
          );
        }
        
        
        // Update resultVideo if provided
        if (files.resultVideo && files.resultVideo.length > 0) {
          const nextResultVideo = files.resultVideo;
          filePromises.push(
            (async () => {
              // Delete old Firebase file and DB record if exists
              if (result.resultVideo) {
                const oldFile = bucket.file(result.resultVideo.location ?? "");
                const [exists] = await oldFile.exists();
                if (exists) {
                  await oldFile.delete();
                  // console.log("Deleted old resultVideo from Firebase:", result.resultVideo.location);
                }
                await File.deleteOne({
                  _id: (result.resultVideo as unknown as { _id: Types.ObjectId })
                    ._id,
                });
              }
        
              // Upload new file to Firebase
              const { publicUrl, filePath, token } = await uploadFileToFirebase(
                nextResultVideo[0],
                "result_videos"
              );
        
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
            })()
          );
        }
        
        // Wait for all file updates to finish
        await Promise.all(filePromises);
        

    // Save the updated result data
    const updatedResult = await result.save();

    return updatedResult;
  } catch (error) {
    throw new Error(`Failed to update result data: ${error.message}`);
  }
};

export const deleteElectionResultDataService = async (
  electionId: Id,
  userId: Id
) => {
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
    const electionIsOver =
      election.endDate && new Date(election.endDate).getTime() <= Date.now();
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

    await detachResultFromActiveElection(result.election, result._id);

    return { message: "Result data deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete result data: ${error.message}`);
  }
};


export const getUserElectionData = async (userId: Id) => {
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
  } catch (error) {
    console.error(`Error fetching election data for user ${userId}:`, error.message);
    throw new Error(`Failed to fetch election data: ${error.message}`);
  }
};

export const getAllElectionResults = async () => {
  try {
    const aggregateIncidents = (incidents: unknown[]) => incidents;
    const aggregateResults = (results: unknown[]) => results;
    type ElectionLite = { electionType?: string; electionName?: string };
    type ActiveElectionWithElection = {
      _id: Types.ObjectId | string;
      election?: ElectionLite;
      resultsCount?: number;
    };

    const activeElections = await ActiveElection.find()
      .populate("election", "electionType electionName")
      .lean();
    if (!activeElections || activeElections.length === 0) {
      throw new Error("No elections found");
    }

    const allResults: Record<string, unknown> = {};

    for (const election of activeElections as unknown as ActiveElectionWithElection[]) {
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
          // Prefer live count over denormalized ActiveElection.resultsCount.
          resultsCount: results.length,
        },
        results: aggregatedResults,
        incidents: aggregateIncidents(incidents) || [],
      };
    }

    return allResults;
  } catch (error) {
    console.error(`Error fetching all election results: ${error.message}`);
    throw new Error(`Error fetching all election results: ${error.message}`);
  }
};

export const uploadIncidentReportDataService = async (
  electionId: Id,
  userId: Id,
  data: IncidentReportBody,
  files: IncidentReportUploadLike,
  options?: { requireObserverUploadLocation?: boolean }
) => {
  try {
    const { selectIncident, incidentNote, electionRating, uploadLocation } = data;
    const normalizedIncidentNote =
      typeof incidentNote === "string" ? incidentNote.trim() : "";

    if (!selectIncident) {
      throw new Error("selectIncident is required.");
    }
    if (!normalizedIncidentNote) {
      throw new Error("incidentNote is required.");
    }

    // Check election existence
    const activeElection = await ActiveElection.findById(electionId);
    if (!activeElection) throw new Error("Election not found");
    assertActiveElectionIsLiveNow(activeElection);

    // Check user existence
    const user = await CompletedUser.findById(userId);
    if (!user) throw new Error("User not found");
    assertCanManageElectionSubmission(user.role);

    // Check if incident report exists
    const existingReport = await IncidentReport.findOne({
      election: electionId,
      user: userId,
    });
    if (existingReport) return existingReport;

    // One-submission-only policy: user can submit either result OR incident for an active election.
    const existingResult = await ElectionData.findOne({
      election: electionId,
      user: userId,
    }).select("_id");
    if (existingResult) {
      throw new Error(
        "You have already submitted an election result for this election. Only one submission (result or incident) is allowed."
      );
    }

    const parsedUploadLocation = parseUploadLocation(uploadLocation);
    const requireObserverUploadLocation =
      options?.requireObserverUploadLocation !== false;
    if (
      requireObserverUploadLocation &&
      user.role === "observer" &&
      !parsedUploadLocation
    ) {
      throw new Error(
        "Observers must enable and provide upload location before submitting incident reports."
      );
    }

    const allowedVideoExtensions = [".mp4", ".avi", ".mov", ".webm", ".wmv"];
    const allowedImageExtensions = [".jpg", ".jpeg", ".webp", ".png", ".svg"];
    
    // Validate file extension
    const validateFile = (
      file: MulterMemoryFile,
      allowedExtensions: readonly string[]
    ) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new Error(
          `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`
        );
      }
      return ext;
    };

        // Validate that both incidentPicture and incidentVideo are uploaded
        if (
          (!files["incidentVideos[]"] || files["incidentVideos[]"].length === 0) ||
          (!files["incidentPictures[]"] || files["incidentPictures[]"].length === 0)
        ) {
          throw new Error(
            "Both incidentPicture and incidentVideo must be uploaded."
          );
        }

      
    
    // Upload and validate incident videos
    const incidentVideoPromises =
      files["incidentVideos[]"]?.map(async (file: MulterMemoryFile) => {
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
    
    const incidentPicturePromises =
      files["incidentPictures[]"]?.map(async (file: MulterMemoryFile) => {
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
    await syncActiveElectionIncidentRefs(electionId);
    await invalidateAllMobileReadCaches();

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
  } catch (error) {
    console.error("Error uploading incident report data", error);
    throw new Error(`Error saving election incident: ${error.message}`);
  }
};


export const updateIncidentReportDataService = async (
  electionId: Id,
  userId: Id,
  data: IncidentReportBody = {},
  files: IncidentReportUploadLike = {},
  replaceFiles = false
) => {
  try {
    const {
      selectIncident,
      incidentNote,
      electionRating,
      uploadLocation,
      keepIncidentVideoIds = [],
      keepIncidentPictureIds = [],
    } = data;

    const allowedVideoExtensions = [".mp4", ".avi", ".mov", ".webm", ".wmv"];
    const allowedImageExtensions = [".jpg", ".jpeg", ".webp", ".png", ".svg"];

    const validateFile = (
      file: MulterMemoryFile,
      allowedExtensions: readonly string[]
    ) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new Error(
          `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`
        );
      }
    };

    const electionExists = await ActiveElection.findById(electionId);
    if (!electionExists) throw new Error("Election not found");

    const user = await CompletedUser.findById(userId);
    if (!user) throw new Error("User not found");
    assertCanManageElectionSubmission(user.role);

    const report = await IncidentReport.findOne({
      election: electionId,
      user: userId,
    });
    if (!report) throw new Error("Incident report not found or unauthorized");

    if (selectIncident != null && String(selectIncident).trim() === "") {
      throw new Error("selectIncident is required.");
    }
    if (incidentNote != null && String(incidentNote).trim() === "") {
      throw new Error("incidentNote is required.");
    }

    const parsedUploadLocation = parseUploadLocation(uploadLocation);
    if (parsedUploadLocation) {
      (report as unknown as { uploadLocation?: ParsedUploadLocation }).uploadLocation =
        parsedUploadLocation;
    }

    report.selectIncident = selectIncident ?? report.selectIncident;
    report.incidentNote =
      incidentNote != null ? String(incidentNote).trim() : report.incidentNote;
    report.electionRating = electionRating ?? report.electionRating;
    const reportWithMedia = report as unknown as {
      incidentPictures: unknown;
      incidentVideos: unknown;
    };

    // Helper: delete old files not in keepIds
    type StoredFileRef = { _id: Types.ObjectId | string; location: string };
    const deleteUnkeptFiles = async (
      existingFiles: StoredFileRef[],
      keepIds: Array<Types.ObjectId | string> = []
    ) => {
      const keep = keepIds.map(String);
      const toDelete = existingFiles.filter((f) => !keep.includes(String(f._id)));
      await Promise.all(
        toDelete.map(async (file) => {
          const oldFile = bucket.file(file.location);
          const [exists] = await oldFile.exists();
          if (exists) await oldFile.delete();
          await File.deleteOne({ _id: file._id });
        })
      );
      return existingFiles.filter((f) => keep.includes(String(f._id)));
    };

    // Process incidentPictures
    if (files.incidentPictures && files.incidentPictures.length > 0) {
      let keptPictures: StoredFileRef[] = [];

      if (replaceFiles) {
        // Delete all old
        await deleteUnkeptFiles(
          report.incidentPictures as unknown as Array<{
            _id: Types.ObjectId | string;
            location: string;
          }>
        );
      } else {
        // Delete only unkept
        keptPictures = await deleteUnkeptFiles(
          report.incidentPictures as unknown as Array<{
            _id: Types.ObjectId | string;
            location: string;
          }>,
          keepIncidentPictureIds
        );
      }

      const newPictures = await Promise.all(
        files.incidentPictures.map(async (file: MulterMemoryFile) => {
          validateFile(file, allowedImageExtensions);
          const { publicUrl, filePath, token } = await uploadFileToFirebase(
            file,
            "incident_pictures"
          );
          return await File.create({
            location: filePath,
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
            url: publicUrl,
            token,
          });
        })
      );

      reportWithMedia.incidentPictures = replaceFiles
        ? newPictures
        : [...keptPictures, ...newPictures];
    }

    // Process incidentVideos
    if (files.incidentVideos && files.incidentVideos.length > 0) {
      let keptVideos: StoredFileRef[] = [];

      if (replaceFiles) {
        await deleteUnkeptFiles(
          report.incidentVideos as unknown as Array<{
            _id: Types.ObjectId | string;
            location: string;
          }>
        );
      } else {
        keptVideos = await deleteUnkeptFiles(
          report.incidentVideos as unknown as Array<{
            _id: Types.ObjectId | string;
            location: string;
          }>,
          keepIncidentVideoIds
        );
      }

      const newVideos = await Promise.all(
        files.incidentVideos.map(async (file: MulterMemoryFile) => {
          validateFile(file, allowedVideoExtensions);
          const { publicUrl, filePath, token } = await uploadFileToFirebase(
            file,
            "incident_videos"
          );
          return await File.create({
            location: filePath,
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
            url: publicUrl,
            token,
          });
        })
      );

      reportWithMedia.incidentVideos = replaceFiles
        ? newVideos
        : [...keptVideos, ...newVideos];
    }

    const updatedReport = await report.save();
    return updatedReport;
  } catch (error) {
    throw new Error(`Failed to update incident report data: ${error.message}`);
  }
};

export const deleteIncidentReportDataService = async (
  electionId: Id,
  userId: Id
) => {
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
    const electionIsOver =
      election.endDate && new Date(election.endDate).getTime() <= Date.now();
    if (user.role === "observer" && electionIsOver) {
      throw new Error(
        "Election is over. Observers cannot delete incident reports."
      );
    }

    // Find the incident report and ensure it belongs to the requesting user
    const incidentReport = await IncidentReport.findOneAndDelete({
      election: electionId,
      user: userId,
    });

    if (!incidentReport) {
      throw new Error("Incident report not found or unauthorized");
    }

    await detachIncidentFromActiveElection(
      incidentReport.election,
      incidentReport._id
    );

    return { message: "Incident report deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete incident report data: ${error.message}`);
  }
};


export const getUserElectionResultsAndReports = async (userId: Id) => {
  type ElectionSummary = {
    _id?: Types.ObjectId | string;
    election?: { electionType?: string; electionName?: string };
    startDate?: Date | string;
    endDate?: Date | string;
    mockElection?: boolean;
    electionLocation?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  type UserResultOrIncident = {
    _id?: Types.ObjectId | string;
    election?: ElectionSummary | null;
    [key: string]: unknown;
  };

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

const formattedElectionResults = (electionResults as UserResultOrIncident[]).map((result) => {
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

const formattedIncidentReports = (incidentReports as UserResultOrIncident[]).map((incident) => {
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
  } catch (error) {
    console.error(
      `Error fetching election results and incident reports: ${error.message}`
    );
    throw new Error(
      `Failed to fetch election results and incident reports: ${error.message}`
    );
  }
};


export const getResultsAndPerformAction = async (
  userId: Id,
  actionData: PollingUnitActionPayload | null | undefined,
  flagMediaFiles?: FlagMediaFiles,
  options?: { requireSamePollingUnit?: boolean }
) => {
  try {
    const requireSamePollingUnit = options?.requireSamePollingUnit !== false;
    const user = await CompletedUser.findById(userId).lean();
    if (!user || !user.pollingUnit) {
      throw new Error("User not found or polling unit is missing");
    }
    if (user.role === "public-viewer") {
      throw new Error(
        "Public viewers cannot agree or flag election results or incidents."
      );
    }

    const pollingUnit = user.pollingUnit;

    if (!actionData) {
      return await fetchResults(pollingUnit, userId);
    }

    if (!["agree", "flag", "unagree", "unflag"].includes(actionData.action)) {
      throw new Error("Invalid action. Use agree, flag, unagree, or unflag.");
    }
    if (!["election", "incident"].includes(actionData.dataType)) {
      throw new Error("Invalid data type. It must be 'election' or 'incident'.");
    }

    const dataModel = (actionData.dataType === "election"
      ? ElectionData
      : IncidentReport) as unknown as {
      findById: (id: Id) => Promise<unknown>;
    };

    type ActionSubdoc = {
      userId?: Types.ObjectId | string;
      action?: string;
      flagReason?: string;
      evidenceId?: Types.ObjectId | string;
      flagImage?: EmbeddedFlagFile;
      flagVideo?: EmbeddedFlagFile;
    };

    type FlaggableDoc = {
      user: Types.ObjectId | string;
      election?: Types.ObjectId | string;
      pollingUnit?: string | null;
      actions: ActionSubdoc[];
      flagged?: boolean;
      priorityLevel?: number;
      hidden?: boolean;
      save: () => Promise<unknown>;
    };

    const data = (await dataModel.findById(
      actionData.electionId
    )) as FlaggableDoc | null;
    if (!data) {
      throw new Error(
        `${
          actionData.dataType === "election"
            ? "Election result"
            : "Incident report"
        } not found`
      );
    }

    const activeElectionId = data.election ? String(data.election) : undefined;

    if (data.user && String(data.user) === String(userId)) {
      throw new Error("You cannot act on your own result or incident.");
    }

    // Web user-action is polling-unit scoped. Mobile collation uses election
    // coverage filters instead (state / LGA / ward).
    if (
      requireSamePollingUnit &&
      (!data.pollingUnit ||
        String(data.pollingUnit).trim() !== String(pollingUnit).trim())
    ) {
      throw new Error(
        "You can only agree or flag submissions from your polling unit."
      );
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

    // Viewing concluded elections is allowed; agree/flag/unflag only while live.
    if (isActiveElectionConcluded(activeElection.endDate)) {
      throw new Error(
        "Agree and flag are only allowed while the election is live. You can still view results and incidents."
      );
    }

    const electionRef = activeElection.election as unknown as {
      electionType?: string;
      electionName?: string;
    } | null;
    if (
      !isActiveElectionRelevantForUser(
        electionRef ?? undefined,
        activeElection.electionLocation,
        user
      )
    ) {
      throw new Error("This election is not available for your location");
    }

    // Flag requires a prior upload so the actor has counter-data. Agree does not.
    let evidenceId: Id | undefined;
    if (actionData.action === "flag") {
      const submissionCheck = await checkUserSubmissionStatusForFlag(userId, {
        electionId: actionData.electionId,
        action: "flag",
        dataType: actionData.dataType,
      });
      if (!submissionCheck.hasUploaded || !submissionCheck.evidenceId) {
        throw new Error(
          "You must have submitted a result or incident for this election before you can flag."
        );
      }
      evidenceId = submissionCheck.evidenceId as Id;
    }

    let flagMediaEmbedded: {
      flagImage?: EmbeddedFlagFile;
      flagVideo?: EmbeddedFlagFile;
    } = {};
    if (actionData.action === "flag") {
      if (!actionData.flagReason?.trim()) {
        throw new Error("Flag reason is required when flagging.");
      }
      flagMediaEmbedded = await embedFlagEvidenceFiles(flagMediaFiles);
    }

    const existingActionIndex = data.actions.findIndex(
      (a) => a.userId != null && String(a.userId) === String(userId)
    );
    const existingAction = data.actions[existingActionIndex];
    const wasAlreadyFlaggedByActor = existingAction?.action === "flag";
    const previousFlaggedCount = data.actions.filter(
      (a) => a.action === "flag"
    ).length;

    if (existingAction) {
      if (actionData.action === "agree") {
        if (existingAction.action === "agree") {
          data.actions.splice(existingActionIndex, 1);
        } else if (existingAction.action === "flag") {
          throw new Error("You cannot agree after flagging the result.");
        } else {
          existingAction.action = "agree";
          if (evidenceId) existingAction.evidenceId = evidenceId;
          if (data.user) {
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
      } else if (actionData.action === "flag") {
        existingAction.action = "flag";
        existingAction.flagReason = actionData.flagReason!.trim();
        if (flagMediaEmbedded.flagImage) {
          existingAction.flagImage = flagMediaEmbedded.flagImage;
        }
        if (flagMediaEmbedded.flagVideo) {
          existingAction.flagVideo = flagMediaEmbedded.flagVideo;
        }
        existingAction.evidenceId = evidenceId;
        if (!wasAlreadyFlaggedByActor && data.user) {
          await dispatchNotificationToUsers({
            type: "report-flagged",
            preferenceKey: "reportFlagged",
            body: "Your report/result was flagged for review.",
            info: formatFlagNotificationInfo(
              actionData.flagReason,
              flagMediaEmbedded
            ),
            activeElectionId,
            userIds: [String(data.user)],
          });
        }
      } else if (actionData.action === "unagree") {
        if (existingAction.action === "agree") {
          data.actions.splice(existingActionIndex, 1);
        } else {
          throw new Error("You haven't agreed to this result/report.");
        }
      } else if (actionData.action === "unflag") {
        if (existingAction.action === "flag") {
          data.actions.splice(existingActionIndex, 1);
        } else {
          throw new Error("You haven't flagged this result/report.");
        }
      }
    } else {
      if (actionData.action === "unagree") {
        throw new Error("You haven't agreed to this result/report.");
      }
      if (actionData.action === "unflag") {
        throw new Error("You haven't flagged this result/report.");
      }

      const newAction: ActionSubdoc = {
        userId,
        action: actionData.action,
      };
      if (evidenceId) {
        newAction.evidenceId = evidenceId;
      }
      if (actionData.action === "flag") {
        newAction.flagReason = actionData.flagReason!.trim();
        if (flagMediaEmbedded.flagImage) {
          newAction.flagImage = flagMediaEmbedded.flagImage;
        }
        if (flagMediaEmbedded.flagVideo) {
          newAction.flagVideo = flagMediaEmbedded.flagVideo;
        }
        if (data.user) {
          await dispatchNotificationToUsers({
            type: "report-flagged",
            preferenceKey: "reportFlagged",
            body: "Your report/result was flagged for review.",
            info: formatFlagNotificationInfo(
              actionData.flagReason,
              flagMediaEmbedded
            ),
            activeElectionId,
            userIds: [String(data.user)],
          });
        }
      } else if (actionData.action === "agree") {
        if (data.user) {
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
      data.actions.push(newAction);
    }

    const totalUsersInPollingUnit = await CompletedUser.countDocuments({
      pollingUnit: user.pollingUnit,
      role: { $in: ["observer", "volunteer"] },
    });

    const totalUsers =
      totalUsersInPollingUnit > 0 ? totalUsersInPollingUnit : 1;
    const flaggedCount = data.actions.filter((a) => a.action === "flag").length;
    const priorityLevel = Math.round((flaggedCount / totalUsers) * 100);
    const previousPriority = Math.round(
      (previousFlaggedCount / totalUsers) * 100
    );

    if (flaggedCount > 0) {
      data.flagged = true;
      data.priorityLevel = priorityLevel;
    } else {
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
    } else {
      data.hidden = false;
    }

    await data.save();

    return await fetchResults(pollingUnit, userId);
  } catch (error) {
    throw new Error(`Error processing action: ${error.message}`);
  }
};

// Helper function to fetch results and reports for a polling unit and specific user
const fetchResults = async (pollingUnit: string, userId: Id) => {
  type ActionRef = { userId?: Types.ObjectId | string; action?: string };
  type ElectionNested = {
    _id?: Types.ObjectId | string;
    election?: { electionType?: string; electionName?: string };
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    electionLocation?: string | null;
  };
  type ObserverResult = {
    _id: Types.ObjectId | string;
    pollingUnit?: string;
    createdAt?: Date | string;
    partiesVotes?: unknown;
    voteRating?: string | null;
    voterIntimidation?: string | null;
    voteBuying?: string | null;
    resultPicture?: unknown;
    resultVideo?: unknown;
    hidden?: boolean;
    priorityLevel?: number;
    actions: ActionRef[];
    timeBegan?: string | null;
    election?: ElectionNested | null;
    isApproved?: boolean;
  };
  type ObserverIncident = {
    _id: Types.ObjectId | string;
    pollingUnit?: string;
    createdAt?: Date | string;
    selectIncident?: string | null;
    incidentNote?: string | null;
    electionRating?: string | null;
    incidentPictures?: unknown;
    incidentVideos?: unknown;
    hidden?: boolean;
    priorityLevel?: number;
    actions: ActionRef[];
    election?: ElectionNested | null;
  };

  const approvedObservers = await CompletedUser.find(
    { role: "observer", isObserverInPollingUnit: true },
    "_id"
  ).lean();
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
  const resultData = (electionResults as unknown as ObserverResult[]).map(
    (result) => {
    const e = result.election;
    const userAction = result.actions.find(
      (a) => String(a.userId) === String(userId)
    );

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
  const reportData = (incidentReports as unknown as ObserverIncident[]).map(
    (report) => {
    const e = report.election;
    const userAction = report.actions.find(
      (a) => String(a.userId) === String(userId)
    );

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

export const checkUserSubmissionStatusForFlag = async (
  userId: Id,
  actionData: FlagSubmissionCheckPayload
) => {
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
  } else if (dataType === "incident") {
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
  } else if (incidentSubmission) {
    return { hasUploaded: true, evidenceId: incidentSubmission._id };
  }

  return { hasUploaded: false };
};


