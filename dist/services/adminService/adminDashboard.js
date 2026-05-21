import moment from "moment";
import CompletedUser from "../../models/CompletedUser.js";
import ElectionData from "../../models/Election/ElectionData.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import Traffic from "../../models/DailyTraffic/dailyTraffic.js";
import ActiveUser from "../../models/ActiveMontlyUsers/activeMontlyUsers.js";
import { sendEmail } from "../../config/email.js";
import ActiveElection from "../../models/Election/ActiveElection.js";
import AdminPermissions from "../../models/admin/AdminPermissions.js";
import AdminLog from "../../models/admin/AdminLog.js";
import { adminRoleInvitationTemplate, adminSuspensionTemplate, approveObserverTemplate, observerDowngradeTemplate, observerRoleAvailableTemplate, observerNotApprovedInvalidPvcTemplate, observerRoleUpdateTemplate } from "../../config/emailTemplates.js";
import { getPopulatedElectionLabels } from "./adminElectionService.js";
import { dispatchNotificationToUsers, } from "../mobile/notificationDispatchService.js";
const errMsg = (error) => error instanceof Error ? error.message : String(error);
export const getDashboardData = async () => {
    const today = moment().startOf("day");
    const lastMonthStart = moment().subtract(1, "month").startOf("month");
    const lastMonthEnd = moment().subtract(1, "month").endOf("month");
    // Registered Users
    const registeredUsersCount = await CompletedUser.countDocuments();
    const lastMonthRegisteredUsers = await CompletedUser.countDocuments({
        createdAt: { $gte: lastMonthStart.toDate(), $lte: lastMonthEnd.toDate() },
    });
    const thisMonthRegisteredUsers = await CompletedUser.countDocuments({
        createdAt: { $gte: moment().startOf("month").toDate() },
    });
    const registeredUsersComparison = lastMonthRegisteredUsers
        ? Math.round(((thisMonthRegisteredUsers - lastMonthRegisteredUsers) /
            lastMonthRegisteredUsers) *
            100) + "%"
        : "0%";
    const registeredUsersData = await getDailyStats(CompletedUser, "createdAt");
    // Observers
    const observersCount = await CompletedUser.countDocuments({
        role: "observer",
    });
    const lastMonthObservers = await CompletedUser.countDocuments({
        role: "observer",
        createdAt: { $gte: lastMonthStart.toDate(), $lte: lastMonthEnd.toDate() },
    });
    const observersComparison = lastMonthObservers
        ? Math.round(((observersCount - lastMonthObservers) / lastMonthObservers) * 100) + "%"
        : "0%";
    const observersData = await getDailyStats(CompletedUser, "createdAt", {
        role: "observer",
    });
    // Active Users
    const currentMonthKey = moment().format("YYYY-MM");
    const lastMonthKey = moment().subtract(1, "month").format("YYYY-MM");
    const currentMonthActiveUsers = await ActiveUser.findOne({
        month: currentMonthKey,
    });
    const lastMonthActiveUsers = await ActiveUser.findOne({
        month: lastMonthKey,
    });
    const activeUsersCount = currentMonthActiveUsers?.users.length || 0;
    const lastMonthActiveCount = lastMonthActiveUsers?.users.length || 0;
    const activeUsersComparison = lastMonthActiveCount
        ? Math.round(((activeUsersCount - lastMonthActiveCount) / lastMonthActiveCount) * 100) + "%"
        : "0%";
    const activeUsersData = await getTrafficStats();
    // Results Uploaded
    const resultsUploadedCount = await ElectionData.countDocuments();
    const resultsLastMonth = await ElectionData.countDocuments({
        createdAt: { $gte: lastMonthStart.toDate(), $lte: lastMonthEnd.toDate() },
    });
    const resultsComparison = resultsLastMonth
        ? Math.round(((resultsUploadedCount - resultsLastMonth) / resultsLastMonth) * 100) + "%"
        : "0%";
    const resultsData = await getDailyStats(ElectionData, "createdAt");
    // User Info
    const genderBreakdown = await CompletedUser.aggregate([
        { $match: { gender: { $exists: true } } },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
        { $project: { name: "$_id", count: 1, _id: 0 } },
    ]);
    const rolesBreakdown = await CompletedUser.aggregate([
        { $match: { role: { $in: ["observer", "volunteer"] } } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $project: { name: "$_id", count: 1, _id: 0 } },
    ]);
    // Admins
    const admins = await CompletedUser.find({ role: { $in: ["admin", "super-admin"] } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("email firstName lastName role profileImage");
    // Daily Traffic
    const dailyTrafficToday = await Traffic.findOne({ date: today.toDate() });
    const dailyTrafficLastMonth = await Traffic.find({
        date: { $gte: lastMonthStart.toDate(), $lte: lastMonthEnd.toDate() },
    });
    const dailyTrafficCount = dailyTrafficToday?.visitCount || 0;
    const dailyTrafficComparison = dailyTrafficLastMonth?.length
        ? Math.round(((dailyTrafficCount - dailyTrafficLastMonth.length) /
            dailyTrafficLastMonth.length) *
            100) + "%"
        : "0%";
    const dailyTrafficData = await getTrafficStats();
    // Final Response
    return {
        registeredUsers: {
            count: registeredUsersCount,
            lastMonthComparison: registeredUsersComparison,
            data: registeredUsersData,
        },
        observers: {
            count: observersCount,
            lastMonthComparison: observersComparison,
            data: observersData,
        },
        activeUsers: {
            count: activeUsersCount,
            lastMonthComparison: activeUsersComparison,
            data: activeUsersData,
        },
        resultsUploaded: {
            count: resultsUploadedCount,
            lastMonthComparison: resultsComparison,
            data: resultsData,
        },
        userInfo: {
            gender: genderBreakdown,
            roles: rolesBreakdown,
        },
        admins,
        dailyTraffic: {
            count: dailyTrafficCount,
            lastMonthComparison: dailyTrafficComparison,
            data: dailyTrafficData,
        },
    };
};
// Get all users
export const getAllUsersService = async () => {
    try {
        const lastMonthStart = moment().subtract(1, "month").startOf("month");
        const lastMonthEnd = moment().subtract(1, "month").endOf("month");
        // Fetch all user details
        const users = await CompletedUser.find()
            .select("_id firstName lastName email state role gender createdAt pendingObserverVerification ")
            .lean();
        // Total number of registered users
        const registeredUsersCount = await CompletedUser.countDocuments();
        const lastMonthRegisteredUsers = await CompletedUser.countDocuments({
            createdAt: { $gte: lastMonthStart.toDate(), $lte: lastMonthEnd.toDate() },
        });
        const thisMonthRegisteredUsers = await CompletedUser.countDocuments({
            createdAt: { $gte: moment().startOf("month").toDate() },
        });
        const registeredUsersComparison = lastMonthRegisteredUsers
            ? Math.round(((thisMonthRegisteredUsers - lastMonthRegisteredUsers) /
                lastMonthRegisteredUsers) *
                100) + "%"
            : "0%";
        const registeredUsersData = await getDailyStats(CompletedUser, "createdAt");
        // Total number of observers
        const observersCount = await CompletedUser.countDocuments({
            role: "observer",
        });
        const lastMonthObservers = await CompletedUser.countDocuments({
            role: "observer",
            createdAt: {
                $gte: lastMonthStart.toDate(),
                $lte: lastMonthEnd.toDate(),
            },
        });
        const observersComparison = lastMonthObservers
            ? Math.round(((observersCount - lastMonthObservers) / lastMonthObservers) * 100) + "%"
            : "0%";
        const observersData = await getDailyStats(CompletedUser, "createdAt", {
            role: "observer",
        });
        //  Total number of volunteers
        const volunteersCount = await CompletedUser.countDocuments({
            role: "volunteer",
        });
        const lastMonthVolunteers = await CompletedUser.countDocuments({
            role: "volunteer",
            createdAt: {
                $gte: lastMonthStart.toDate(),
                $lte: lastMonthEnd.toDate(),
            },
        });
        const volunteersComparison = lastMonthVolunteers
            ? Math.round(((volunteersCount - lastMonthVolunteers) / lastMonthVolunteers) * 100) + "%"
            : "0%";
        const volunteersData = await getDailyStats(CompletedUser, "createdAt", {
            role: "volunteer",
        });
        // Total number of observers awaiting verification
        const observersAwaitingVerification = await CompletedUser.countDocuments({
            role: "observer",
            pendingObserverVerification: true,
        });
        const lastMonthAwaitingVerification = await CompletedUser.countDocuments({
            role: "observer",
            pendingObserverVerification: true,
            createdAt: {
                $gte: lastMonthStart.toDate(),
                $lte: lastMonthEnd.toDate(),
            },
        });
        const awaitingVerificationComparison = lastMonthAwaitingVerification
            ? Math.round(((observersAwaitingVerification - lastMonthAwaitingVerification) /
                lastMonthAwaitingVerification) *
                100) + "%"
            : "0%";
        const observersAwaitingVerificationData = await getDailyStats(CompletedUser, "createdAt", {
            role: "observer",
            pendingObserverVerification: true,
        });
        // Gender breakdown
        const genderBreakdown = await CompletedUser.aggregate([
            { $group: { _id: "$gender", count: { $sum: 1 } } },
            { $project: { name: "$_id", count: 1, _id: 0 } },
        ]);
        // Role breakdown
        const rolesBreakdown = await CompletedUser.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
            { $project: { name: "$_id", count: 1, _id: 0 } },
        ]);
        // Response
        return {
            registeredUsers: {
                count: registeredUsersCount,
                lastMonthComparison: registeredUsersComparison,
                data: registeredUsersData,
            },
            observers: {
                count: observersCount,
                lastMonthComparison: observersComparison,
                data: observersData,
            },
            volunteers: {
                count: volunteersCount,
                lastMonthComparison: volunteersComparison,
                data: volunteersData,
            },
            awaitingVerification: {
                count: observersAwaitingVerification,
                lastMonthComparison: awaitingVerificationComparison,
                data: observersAwaitingVerificationData,
            },
            userInfo: {
                gender: genderBreakdown,
                roles: rolesBreakdown,
            },
            users,
        };
    }
    catch (error) {
        throw new Error(`Error fetching users and stats: ${errMsg(error)}`);
    }
};
// Fetch single user info
export const getUserByIdService = async (id) => {
    try {
        const user = await CompletedUser.findById(id).lean();
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        throw new Error(`Error fetching user: ${errMsg(error)}`);
    }
};
// Delete single user
export const deleteUserService = async (userId, adminId) => {
    try {
        const user = await CompletedUser.findById(userId);
        if (!user) {
            throw new Error("User not found or already deleted");
        }
        // Delete user's election results
        await ElectionData.deleteMany({ user: userId });
        // Delete user's incident reports
        await IncidentReport.deleteMany({ user: userId });
        // Delete the user
        await CompletedUser.findByIdAndDelete(userId);
        // Log the admin action
        await AdminLog.create({
            admin: adminId,
            action: "Deleted user",
            details: { userId, email: user.email },
            timestamp: new Date(),
        });
        return { message: "User deleted successfully" };
    }
    catch (error) {
        throw new Error(`Error deleting user: ${errMsg(error)}`);
    }
};
export const approveObserverService = async (id, adminId) => {
    try {
        // Find the user by ID
        const user = await CompletedUser.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        if (user.role !== "observer") {
            throw new Error("User is not an observer");
        }
        // Approve the observer and update their details
        user.isObserverInPollingUnit = true;
        user.pendingObserverVerification = false;
        await user.save();
        // Notify the approved observer via email
        const htmlContent = approveObserverTemplate(user.firstName ?? "", user.pollingUnit ?? "");
        await sendEmail({
            to: user.email,
            subject: "Observer Approval - Citizen Monitors",
            htmlbody: htmlContent,
        });
        await dispatchNotificationToUsers({
            type: "pending-approval",
            preferenceKey: "pollingUnitActivity",
            body: "Your observer account has been approved",
            info: user.pollingUnit ? `Polling unit: ${user.pollingUnit}` : "",
            userIds: [String(user._id)],
            respectPreferences: false,
        });
        // Find all users in the same polling unit
        const usersInPollingUnit = await CompletedUser.find({
            pollingUnit: user.pollingUnit,
            _id: { $ne: id },
        });
        for (const otherUser of usersInPollingUnit) {
            if (otherUser.role === "observer") {
                // Downgrade other observers to volunteers
                otherUser.role = "volunteer";
                otherUser.isObserverInPollingUnit = false;
            }
            if (otherUser.role === "volunteer" &&
                otherUser.pendingObserverVerification) {
                // Remove pending verification for volunteers
                otherUser.pendingObserverVerification = false;
                const htmlContent = observerRoleUpdateTemplate(otherUser.firstName ?? "", user.pollingUnit ?? "");
                // Notify them about new observer
                sendEmail({
                    to: otherUser.email,
                    subject: "Observer Role Update - Citizen Monitors",
                    htmlbody: htmlContent,
                });
                await dispatchNotificationToUsers({
                    type: "pending-approval",
                    preferenceKey: "pollingUnitActivity",
                    body: "Observer role update in your polling unit",
                    info: user.pollingUnit
                        ? `A new observer was approved for ${user.pollingUnit}`
                        : "A new observer was approved in your polling unit",
                    userIds: [String(otherUser._id)],
                    respectPreferences: false,
                });
            }
            await otherUser.save();
        }
        // Log the admin action
        await AdminLog.create({
            admin: adminId,
            action: "Approved observer",
            details: {
                observerId: user._id,
                email: user.email,
                pollingUnit: user.pollingUnit,
            },
            timestamp: new Date(),
        });
        // Fetch all users after updates
        const observers = await CompletedUser.find({ role: "observer" })
            .select("_id firstName lastName email state role gender createdAt pendingObserverVerification isObserverInPollingUnit observerId phoneNumber bankName bankAccountName bankAccountNumber")
            .lean();
        return {
            message: "Observer approved successfully",
            observers,
        };
    }
    catch (error) {
        throw new Error(`Error approving observer: ${errMsg(error)}`);
    }
};
export const getAllObsersverService = async () => {
    try {
        const observers = await CompletedUser.find({ role: "observer" })
            .select("_id firstName lastName email state role gender createdAt pendingObserverVerification isObserverInPollingUnit observerId phoneNumber bankName bankAccountName bankAccountNumber")
            .lean();
        return {
            message: "Observers fetched successfully",
            observers,
        };
    }
    catch (error) {
        throw new Error(`Error fetching observers: ${errMsg(error)}`);
    }
};
// Unapprove = reject a pending observer (e.g. invalid PVC). Change role to volunteer and clear observer details.
export const unapproveObserverService = async (id, adminId) => {
    try {
        const user = await CompletedUser.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        if (user.role !== "observer") {
            throw new Error("User is not an observer");
        }
        if (!user.pendingObserverVerification) {
            throw new Error("User is not pending verification; only pending observers can be unapproved");
        }
        // Change role to volunteer and remove observer-specific details
        user.role = "volunteer";
        user.isObserverInPollingUnit = false;
        user.pendingObserverVerification = false;
        user.set("observerId", []);
        user.phoneNumber = undefined;
        user.bankName = undefined;
        user.bankAccountNumber = undefined;
        user.bankAccountName = undefined;
        await user.save();
        const htmlContent = observerNotApprovedInvalidPvcTemplate(user.firstName ?? "");
        await sendEmail({
            to: user.email,
            subject: "Observer Application Not Approved - Citizen Monitors",
            htmlbody: htmlContent,
        });
        await dispatchNotificationToUsers({
            type: "pending-approval",
            preferenceKey: "pollingUnitActivity",
            body: "Your observer application was not approved",
            info: "Please review your PVC details or contact support.",
            userIds: [String(user._id)],
            respectPreferences: false,
        });
        await AdminLog.create({
            admin: adminId,
            action: "Unapproved observer (invalid PVC)",
            details: {
                observerId: user._id,
                email: user.email,
                pollingUnit: user.pollingUnit,
            },
            timestamp: new Date(),
        });
        const observers = await CompletedUser.find({ role: "observer" })
            .select("_id firstName lastName email state role gender createdAt pendingObserverVerification isObserverInPollingUnit observerId phoneNumber bankName bankAccountName bankAccountNumber")
            .lean();
        return {
            message: "Observer unapproved successfully",
            observers,
        };
    }
    catch (error) {
        throw new Error(`Error unapproving observer: ${errMsg(error)}`);
    }
};
export const downgradeObserverService = async (id, adminReason, adminId) => {
    try {
        // Find the user by ID
        const user = await CompletedUser.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        if (user.role !== "observer" || !user.isObserverInPollingUnit) {
            throw new Error("User is not a verified observer in their polling unit");
        }
        // Downgrade the observer role
        user.role = "volunteer";
        user.isObserverInPollingUnit = false;
        user.pendingObserverVerification = false;
        await user.save();
        const htmlContent = observerDowngradeTemplate(user.firstName ?? "", user.pollingUnit ?? "", adminReason ?? "");
        // Notify the downgraded observer via email
        await sendEmail({
            to: user.email,
            subject: "Observer Role Downgraded - Citizen Monitors",
            htmlbody: htmlContent,
        });
        // Find all users in the same polling unit
        const usersInPollingUnit = await CompletedUser.find({
            pollingUnit: user.pollingUnit,
            _id: { $ne: id },
        });
        for (const otherUser of usersInPollingUnit) {
            // Notify other volunteers about the observer role
            if (otherUser.role === "volunteer" &&
                otherUser.pendingObserverVerification) {
                otherUser.pendingObserverVerification = false;
                const htmlContent = observerRoleAvailableTemplate(otherUser.firstName ?? "", user.pollingUnit ?? "");
                await sendEmail({
                    to: otherUser.email,
                    subject: "Observer Role Available - Citizen Monitors",
                    htmlbody: htmlContent,
                });
            }
            // Save changes for other users
            await otherUser.save();
        }
        // Log the admin action
        await AdminLog.create({
            admin: adminId,
            action: "Downgraded observer",
            details: {
                observerId: id,
                email: user.email,
                pollingUnit: user.pollingUnit,
                reason: adminReason,
            },
            timestamp: new Date(),
        });
        // Fetch all users with role "observer" after updates
        const observers = await CompletedUser.find({ role: "observer" })
            .select("_id firstName lastName email state role gender createdAt pendingObserverVerification isObserverInPollingUnit observerId phoneNumber bankName bankAccountName bankAccountNumber")
            .lean();
        return {
            message: "Observer downgraded successfully",
            observers,
        };
    }
    catch (error) {
        console.error(`Error downgrading observer: ${errMsg(error)}`);
        throw new Error(`Error downgrading observer: ${errMsg(error)}`);
    }
};
// Helper Functions
const getDailyStats = async (model, dateField, match = {}) => {
    const m = model;
    const startOfWeek = moment().subtract(6, "days").startOf("day");
    const stats = (await m.aggregate([
        { $match: { ...match, [dateField]: { $gte: startOfWeek.toDate() } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]));
    return Array(7)
        .fill(0)
        .map((_, idx) => {
        const date = startOfWeek.clone().add(idx, "days").format("YYYY-MM-DD");
        const stat = stats.find((s) => s._id === date);
        return stat ? stat.count : 0;
    });
};
const getTrafficStats = async () => {
    const today = moment().startOf("day");
    const stats = await Traffic.find({
        date: { $gte: today.clone().subtract(6, "days").toDate() },
    }).sort({ date: 1 });
    return Array(7)
        .fill(0)
        .map((_, idx) => {
        const date = today.clone().subtract(idx, "days").format("YYYY-MM-DD");
        const stat = stats.find((s) => moment(s.date).format("YYYY-MM-DD") === date);
        return stat ? stat.visitCount : 0;
    });
};
export const getAllActiveElectionsService = async () => {
    // Fetch all elections with their results and incident reports
    const activeElections = await ActiveElection.find()
        .populate("election", "electionType electionName")
        .lean();
    // Format and return elections, excluding `electionLocation` and unnecessary fields
    return activeElections.map((activeElection) => {
        const { election: electionDetailsRaw, results, incidentReports, resultsCount, politicalParties, ...electionData } = activeElection;
        const labels = getPopulatedElectionLabels({ election: electionDetailsRaw });
        return {
            electionType: labels.type === "N/A" ? undefined : labels.type,
            electionName: labels.name === "N/A" ? undefined : labels.name,
            ...electionData,
        };
    });
};
export const getAllElectionTypesService = async () => {
    // Fetch all elections with their results and incident reports
    const activeElections = await ActiveElection.find()
        .populate("election", "electionType electionName")
        .lean();
    // Format and return elections, excluding `electionLocation` and unnecessary fields
    return activeElections.map((activeElection) => {
        const { election: electionDetailsRaw, results, incidentReports, electionLocation, startDate, endDate, resultsCount, politicalParties, ...electionData } = activeElection;
        const labels = getPopulatedElectionLabels({ election: electionDetailsRaw });
        return {
            electionType: labels.type === "N/A" ? undefined : labels.type,
            electionName: labels.name === "N/A" ? undefined : labels.name,
            ...electionData,
        };
    });
};
export const getAdminLiveElectionService = async (electionId) => {
    try {
        const activeElection = await ActiveElection.findById(electionId)
            .populate("election", "electionType electionName")
            .lean();
        if (!activeElection)
            throw new Error("Election not found");
        const { startDate, endDate, electionLocation, mockElection } = activeElection;
        const labels = getPopulatedElectionLabels(activeElection);
        const electionType = labels.type === "N/A" ? undefined : labels.type;
        const electionName = labels.name === "N/A" ? undefined : labels.name;
        // Fetch live election results
        const electionResults = (await ElectionData.find({
            election: electionId,
            userRole: "observer",
        }).lean());
        if (electionResults.length === 0) {
            return {
                electionDetails: {
                    electionId,
                    electionName,
                    electionType,
                    startDate,
                    endDate,
                    electionLocation,
                    mockElection,
                },
                result: null,
            };
        }
        // Group results by location (state, lga, or ward based on election type)
        const locationResults = electionResults.reduce((acc, result) => {
            const locationKey = electionType === "national"
                ? result.state
                : electionType === "gubernatorial"
                    ? result.state
                    : result.lga;
            const key = locationKey ?? "";
            if (!acc[key])
                acc[key] = [];
            acc[key].push(result);
            return acc;
        }, {});
        // Handle national elections
        if (electionType === "national") {
            const stateArray = Object.keys(locationResults).map((state) => {
                const stateResults = locationResults[state];
                const { resultData, aggregateAnalysis } = aggregateResultsAndTopParties(stateResults, "state");
                const footer = calculateFooter(stateResults, "state", electionLocation);
                return {
                    state,
                    chart: resultData,
                    aggregateAnalysis,
                    footer,
                };
            });
            return {
                electionDetails: {
                    electionId,
                    electionName,
                    electionType,
                    startDate,
                    endDate,
                    electionLocation,
                    mockElection,
                },
                result: stateArray,
            };
        }
        // Handle gubernatorial elections
        if (electionType === "gubernatorial") {
            const uniqueStates = Object.keys(locationResults);
            if (uniqueStates.length === 1) {
                const stateResults = locationResults[uniqueStates[0]];
                const { aggregateAnalysis } = aggregateResultsAndTopParties(stateResults, "lga");
                const footer = calculateFooter(stateResults, "lga", electionLocation);
                return {
                    electionDetails: {
                        electionId,
                        electionName,
                        electionType,
                        startDate,
                        endDate,
                        electionLocation,
                        mockElection,
                    },
                    result: { aggregateAnalysis, footer },
                };
            }
            const stateArray = uniqueStates.map((state) => {
                const stateResults = locationResults[state];
                const { resultData, aggregateAnalysis } = aggregateResultsAndTopParties(stateResults, "lga");
                const footer = calculateFooter(stateResults, "lga", electionLocation);
                return {
                    state,
                    chart: resultData,
                    aggregateAnalysis,
                    footer,
                };
            });
            return {
                electionDetails: {
                    electionId,
                    electionName,
                    electionType,
                    startDate,
                    endDate,
                    electionLocation,
                    mockElection,
                },
                result: stateArray,
            };
        }
        // Handle other elections (senatorial, house-of-representatives, etc.)
        const uniqueLGAs = Object.keys(locationResults);
        if (uniqueLGAs.length === 1) {
            const lgaResults = locationResults[uniqueLGAs[0]];
            const { resultData, aggregateAnalysis } = aggregateResultsAndTopParties(lgaResults, "ward");
            const footer = calculateFooter(lgaResults, "ward", electionLocation);
            return {
                electionDetails: {
                    electionId,
                    electionName,
                    electionType,
                    startDate,
                    endDate,
                    electionLocation,
                    mockElection,
                },
                result: { chart: resultData, aggregateAnalysis, footer },
            };
        }
        const lgaArray = uniqueLGAs.map((lga) => {
            const lgaResults = locationResults[lga];
            const { resultData, aggregateAnalysis } = aggregateResultsAndTopParties(lgaResults, "ward");
            const footer = calculateFooter(lgaResults, "ward", electionLocation);
            return {
                lga,
                chart: resultData,
                aggregateAnalysis,
                footer,
            };
        });
        return {
            electionDetails: {
                electionId,
                electionName,
                electionType,
                startDate,
                endDate,
                electionLocation,
                mockElection,
            },
            result: lgaArray,
        };
    }
    catch (error) {
        throw new Error(`Error fetching admin live election data: ${errMsg(error)}`);
    }
};
const aggregateResultsAndTopParties = (results, groupBy) => {
    const aggregated = {};
    const totalVotesByParty = {};
    results.forEach((result) => {
        const groupKey = String(result[groupBy] ?? "");
        const partiesVotes = result.partiesVotes ?? [];
        // Initialize group if not exists
        if (!aggregated[groupKey]) {
            aggregated[groupKey] = { partiesVotes: {} };
        }
        // Aggregate votes by party
        partiesVotes.forEach(({ party, count }) => {
            const p = party ?? "";
            const c = count ?? 0;
            aggregated[groupKey].partiesVotes[p] =
                (aggregated[groupKey].partiesVotes[p] || 0) + c;
            // Update total aggregate analysis
            totalVotesByParty[p] = (totalVotesByParty[p] || 0) + c;
        });
    });
    return {
        resultData: getTopSevenParties(totalVotesByParty),
        aggregateAnalysis: totalVotesByParty,
    };
};
// Helper: Get Top 7 Parties
const getTopSevenParties = (partiesVotes) => {
    return Object.entries(partiesVotes)
        .sort(([, votesA], [, votesB]) => votesB - votesA) // Sort by descending votes
        .slice(0, 7) // Get top 7
        .map(([party, votes]) => ({ party, [party]: votes }));
};
const calculateFooter = (data, groupBy, electionLocation) => {
    // Ensure electionLocation is valid
    const registeredLocations = new Set(Array.isArray(electionLocation)
        ? electionLocation.map((loc) => String(loc).toUpperCase())
        : []);
    const submittedLocations = new Set(data.map((item) => String(item[groupBy] ?? "").toUpperCase()));
    return {
        [`registered-${groupBy}s`]: registeredLocations.size,
        [`submitted-${groupBy}s`]: submittedLocations.size,
    };
};
// Create Admin or Super Admin
export const createAdminService = async (adminId, { email, role, permissions }) => {
    const user = await CompletedUser.findOne({ email });
    if (!user)
        throw new Error("User not found");
    if (["admin", "super-admin"].includes(user.role ?? "")) {
        throw new Error("User is already an admin or super admin");
    }
    user.role = role;
    // Check if user already has permissions
    let adminPermissions = await AdminPermissions.findOne({ user: user._id });
    if (adminPermissions) {
        throw new Error("User already has assigned permissions");
    }
    // If user is Super Admin and no permissions are assigned, assign all available permissions
    if (role === "super-admin" &&
        (!permissions || Object.keys(permissions).length === 0)) {
        const defaultPermissions = new AdminPermissions().toObject();
        delete defaultPermissions._id;
        delete defaultPermissions.user;
        // Set all permissions to true
        permissions = Object.fromEntries(Object.keys(defaultPermissions).map((key) => [key, true]));
    }
    // Create new permissions document
    adminPermissions = new AdminPermissions({ user: user._id, ...permissions });
    await adminPermissions.save();
    user.adminPermissions = adminPermissions._id;
    await user.save();
    const htmlContent = adminRoleInvitationTemplate(user.firstName ?? "", role ?? "");
    // Send Invitation Email
    await sendEmail({
        to: email,
        subject: "Admin Role Invitation - Citizen Monitors",
        htmlbody: htmlContent,
    });
    // Log admin action
    await AdminLog.create({
        admin: adminId,
        action: `Created ${role} role`,
        details: { email, role, assignedBy: adminId, permissions },
        timestamp: new Date(),
    });
    return { message: "Admin created successfully", user };
};
// Update Admin Permissions
export const updateAdminPermissionsService = async (adminId, updatedBy, { role, permissions }) => {
    try {
        const admin = await CompletedUser.findById(adminId);
        if (!admin || !["admin", "super-admin"].includes(admin.role ?? "")) {
            throw new Error("Admin not found or user is not an admin");
        }
        // Handle role update (Admin ⇄ Super Admin)
        if (role) {
            if (!["admin", "super-admin"].includes(role)) {
                throw new Error("Invalid role. Role must be 'admin' or 'super-admin'");
            }
            admin.role = role;
        }
        // Handle permissions
        if (role === "super-admin" &&
            (!permissions || Object.keys(permissions).length === 0)) {
            // Assign all available permissions to Super Admin
            const allPermissions = AdminPermissions.schema.paths;
            permissions = Object.keys(allPermissions).reduce((acc, key) => {
                if (key !== "_id" && key !== "user")
                    acc[key] = true;
                return acc;
            }, {});
        }
        else if (!permissions || Object.keys(permissions).length === 0) {
            throw new Error("Admin must provide valid permissions to update.");
        }
        // Update or create permissions
        const updatedPermissions = await AdminPermissions.findOneAndUpdate({ user: adminId }, { $set: permissions }, { new: true, upsert: true });
        if (!updatedPermissions) {
            throw new Error("Admin permissions not found or update failed");
        }
        await admin.save();
        // Log the admin action
        await AdminLog.create({
            admin: updatedBy,
            action: `Updated ${role || admin.role} permissions`,
            details: { updatedBy, updatedAdmin: adminId, permissions },
            timestamp: new Date(),
        });
        return { message: "Permissions updated successfully", updatedPermissions };
    }
    catch (error) {
        throw new Error(`Error updating admin permissions: ${errMsg(error)}`);
    }
};
// Suspend Admin
export const suspendAdminService = async (adminId, suspendedBy) => {
    try {
        // Validate admin existence
        const admin = await CompletedUser.findById(adminId);
        if (!admin) {
            throw new Error("Admin not found");
        }
        // Validate suspending admin existence
        const suspendingAdmin = await CompletedUser.findById(suspendedBy);
        if (!suspendingAdmin) {
            throw new Error("Suspending admin not found");
        }
        // Prevent a regular admin from suspending a super admin
        if (admin.role === "super-admin" &&
            suspendingAdmin.role !== "super-admin") {
            throw new Error("Only a super admin can suspend another super admin");
        }
        if (!["admin", "super-admin"].includes(admin.role ?? "")) {
            throw new Error("User is not an admin or super admin");
        }
        // Revoke admin role & permissions
        const updatedAdmin = await CompletedUser.findByIdAndUpdate(adminId, { role: "volunteer", adminPermissions: null }, { new: true });
        if (!updatedAdmin) {
            throw new Error("Failed to suspend admin");
        }
        // Remove associated permissions
        await AdminPermissions.findOneAndDelete({ user: adminId });
        // Delete all logs associated with this admin
        await AdminLog.deleteMany({ admin: adminId });
        // Log admin action
        await AdminLog.create({
            admin: suspendedBy,
            action: "Suspended admin",
            details: { suspendedBy, suspendedAdmin: adminId },
            timestamp: new Date(),
        });
        const htmlContent = adminSuspensionTemplate(admin.firstName ?? "");
        // Send notification email
        await sendEmail({
            to: admin.email,
            subject: "Your Admin Access Has Been Suspended",
            htmlbody: htmlContent,
        });
        return { message: "Admin suspended successfully", updatedAdmin };
    }
    catch (error) {
        throw new Error(`Error suspending admin: ${errMsg(error)}`);
    }
};
// Get all admins with logs
export const getAllAdminsService = async () => {
    const admins = await CompletedUser.find({
        role: { $in: ["admin", "super-admin"] },
    })
        .select("firstName lastName email role profileImage")
        .lean();
    const { totalLogs, logs, statsPercentage } = await processAdminLogs();
    return { admins, totalLogs, logs, statsPercentage };
};
// Access control
export const getAccessControlService = async () => {
    return await AdminLog.find()
        .populate("admin", "firstName lastName email role createdAt")
        .sort({ createdAt: -1 })
        .lean()
        .then((logs) => logs.map(({ admin, action, timestamp }) => ({
        admin: {
            ...admin,
            action,
            timeCreated: timestamp,
        },
    })));
};
// Get Admin Activity Logs
export const getAdminLogsService = async (adminId) => {
    return await AdminLog.find({ admin: adminId })
        .populate("admin", "firstName lastName email role createdAt")
        .sort({ createdAt: -1 })
        .lean()
        .then((logs) => logs.map(({ admin, action, timestamp }) => ({
        admin: {
            ...admin,
            action,
            timeCreated: timestamp,
        },
    })));
};
// Get admin permission
export const getSingleAdminService = async (adminId, { role, permissions }) => {
    try {
        const admin = await CompletedUser.findById(adminId)
            .populate("adminPermissions")
            .lean();
        if (!admin || !["admin", "super-admin"].includes(admin.role ?? "")) {
            throw new Error("Admin not found or user is not an admin");
        }
        // Validate role if provided in the request
        if (role) {
            if (!["admin", "super-admin"].includes(role)) {
                throw new Error("Invalid role. Role must be 'admin' or 'super-admin'");
            }
            admin.role = role;
        }
        // Return requested permissions if provided, otherwise return stored permissions
        const adminPermissions = permissions && Object.keys(permissions).length > 0
            ? permissions
            : admin.adminPermissions || {};
        return {
            _id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            role: admin.role,
            permissions: adminPermissions,
        };
    }
    catch (error) {
        throw new Error(`Error fetching admin details: ${errMsg(error)}`);
    }
};
export const logAdminAction = async (adminId, action) => {
    try {
        await AdminLog.create({
            admin: adminId,
            action,
            timestamp: new Date(),
        });
    }
    catch (error) {
        console.error("Failed to log admin action:", errMsg(error));
    }
};
export const processAdminLogs = async () => {
    const today = moment().startOf("day");
    //  Get Total Logs (All Time)
    const totalLogs = await AdminLog.countDocuments();
    //  Get Logs for the Last 10 Days
    const logs = await AdminLog.find({
        timestamp: { $gte: today.clone().subtract(10, "days").toDate() },
    })
        .sort({ timestamp: 1 })
        .lean();
    // Create 1-day intervals (Last 10 days)
    const intervals = Array.from({ length: 10 }, (_, idx) => ({
        start: today.clone().subtract(idx, "days").startOf("day"),
        end: today.clone().subtract(idx, "days").endOf("day"),
    })).reverse();
    //  Group logs into the 1-day intervals
    const groupedLogs = intervals.map(({ start, end }) => {
        return logs.filter((log) => moment(log.timestamp).isBetween(start, end, null, "[]")).length;
    });
    // Compute Stats Percentage using the last 3 days instead of 1 day
    const lastPeriodLogs = groupedLogs.slice(-3).reduce((sum, val) => sum + val, 0);
    const statsPercentage = totalLogs
        ? `${((lastPeriodLogs / totalLogs) * 100).toFixed(2)}%`
        : "0%";
    return { totalLogs, logs: groupedLogs, statsPercentage };
};
export const downgradeAllObserverService = async (adminReason) => {
    try {
        // Fetch all users with the role "observer"
        const observers = await CompletedUser.find({ role: "observer" });
        if (!observers || observers.length === 0) {
            throw new Error("No observers found to downgrade.");
        }
        // Iterate through each observer and downgrade their role
        for (const observer of observers) {
            observer.role = "volunteer";
            observer.isObserverInPollingUnit = false;
            observer.pendingObserverVerification = false;
            // Save the updated observer
            await observer.save();
            // Notify the downgraded observer via email
            const htmlContent = observerDowngradeTemplate(observer.firstName ?? "", observer.pollingUnit ?? "", adminReason ?? "");
            await sendEmail({
                to: observer.email,
                subject: "Observer Role Downgraded - Citizen Monitors",
                htmlbody: htmlContent,
            });
        }
        // Return success message
        return {
            message: "All observers downgraded successfully",
        };
    }
    catch (error) {
        console.error(`Error downgrading observers: ${errMsg(error)}`);
        throw new Error(`Error downgrading observers: ${errMsg(error)}`);
    }
};
export const getUserEmailsService = async () => {
    try {
        const emails = await CompletedUser.find({}, "email").lean();
        return emails.map(user => user.email);
    }
    catch (error) {
        throw new Error("Failed to retrieve user emails.");
    }
};
//# sourceMappingURL=adminDashboard.js.map