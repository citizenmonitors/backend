/**
 * Data handling for account deletion (self-service and admin).
 *
 * - Observer election results/incidents are kept for collation but anonymised
 *   (`user: null`, `uploaderDeleted: true`).
 * - Everything else the person created or that identifies them is removed:
 *   Pulse content, discussion and article comments, likes, notifications aimed only at
 *   them, feedback, and their profile image and observer ID files in storage.
 */
import mongoose from "mongoose";
import ElectionData from "../../models/Election/ElectionData.js";
import IncidentReport from "../../models/Election/IncidentReport.js";
import PulsePost from "../../models/Pulse/PulsePost.js";
import PulseComment from "../../models/Pulse/PulseComment.js";
import UserBlock from "../../models/Pulse/UserBlock.js";
import CollationDiscussionPost from "../../models/Election/CollationDiscussionPost.js";
import CollationDiscussionComment from "../../models/Election/CollationDiscussionComment.js";
import CollationReportComment from "../../models/Election/CollationReportComment.js";
import NewsInsight from "../../models/admin/NewsInsight.js";
import NewsInsightComment from "../../models/admin/NewsInsightComment.js";
import PressCoverage from "../../models/admin/PressCoverage.js";
import PressCoverageComment from "../../models/admin/PressCoverageComment.js";
import Notification from "../../models/DailyTraffic/Notification.js";
import Podcast from "../../models/admin/Podcast.js";
import MobileFeedback from "../../models/Feedback/mobileFeedback.js";
import profileImageModel from "../../models/UserProfileImage/ProfileImageModel.js";
import observerIdModel from "../../models/observerIds/observerIdModel.js";
import bucket from "../../config/firebaseConfig.js";
import { deletePulsePostCore } from "../mobile/pulseService.js";
/** Keep observer uploads for collation, without anything linking them to the person. */
export const anonymizeUserSubmissions = async (userId) => {
    const update = { $set: { user: null, uploaderDeleted: true } };
    const [results, incidents] = await Promise.all([
        ElectionData.updateMany({ user: userId }, update),
        IncidentReport.updateMany({ user: userId }, update),
    ]);
    return {
        anonymizedResults: results.modifiedCount,
        anonymizedIncidents: incidents.modifiedCount,
    };
};
const deleteStoredFile = async (location, folder) => {
    const path = String(location ?? "").trim();
    // Only touch files we uploaded to Firebase Storage; ignore URLs and legacy local paths.
    if (!path.startsWith(`${folder}/`))
        return false;
    try {
        const file = bucket.file(path);
        const [exists] = await file.exists();
        if (!exists)
            return false;
        await file.delete();
        return true;
    }
    catch (error) {
        console.error(`Account deletion: could not delete ${path}:`, error);
        return false;
    }
};
const deletePulseContent = async (uid) => {
    // Posts one at a time so reposts, quotes and counters on other posts stay consistent.
    const posts = await PulsePost.find({ author: uid }).select("_id").lean();
    for (const { _id } of posts) {
        const post = await PulsePost.findById(_id).select("_id repostedFrom isQuote").lean();
        if (post)
            await deletePulsePostCore(post);
    }
    const likePull = { $pull: { likes: { user: uid } } };
    await Promise.all([
        PulseComment.deleteMany({ author: uid }),
        PulsePost.updateMany({ "likes.user": uid }, likePull),
        PulseComment.updateMany({ "likes.user": uid }, likePull),
        UserBlock.deleteMany({ $or: [{ blocker: uid }, { blocked: uid }] }),
    ]);
    // PulseReport rows are kept for moderation history; after deletion they only hold an id.
    return posts.length;
};
const deleteDiscussionAndCommentContent = async (uid) => {
    const discussionPosts = await CollationDiscussionPost.find({ author: uid }).select("_id").lean();
    const discussionPostIds = discussionPosts.map((p) => p._id);
    const likePull = { $pull: { likes: { user: uid } } };
    await Promise.all([
        CollationDiscussionComment.deleteMany({
            $or: [{ author: uid }, { post: { $in: discussionPostIds } }],
        }),
        CollationDiscussionPost.deleteMany({ author: uid }),
        CollationReportComment.deleteMany({ author: uid }),
        NewsInsightComment.deleteMany({ author: uid }),
        PressCoverageComment.deleteMany({ author: uid }),
    ]);
    await Promise.all([
        CollationDiscussionPost,
        CollationDiscussionComment,
        CollationReportComment,
        NewsInsight,
        NewsInsightComment,
        PressCoverage,
        PressCoverageComment,
    ].map((model) => model.updateMany({ "likes.user": uid }, likePull)));
};
const deleteNotificationTraces = async (uid) => {
    // A notification aimed only at this person goes. Pulling the last id instead would
    // leave targetUsers empty, which means "visible to everyone".
    await Notification.deleteMany({ targetUsers: { $size: 1, $all: [uid] } });
    await Notification.updateMany({ $or: [{ targetUsers: uid }, { readBy: uid }, { deletedBy: uid }] }, { $pull: { targetUsers: uid, readBy: uid, deletedBy: uid } });
    await Podcast.updateMany({ readBy: uid }, { $pull: { readBy: uid } });
};
/** Remove everything personal or user-generated, other than election submissions. */
export const purgeUserPersonalContent = async (user) => {
    const uid = new mongoose.Types.ObjectId(String(user._id));
    const pulsePostsDeleted = await deletePulseContent(uid);
    await deleteDiscussionAndCommentContent(uid);
    await deleteNotificationTraces(uid);
    await MobileFeedback.deleteMany({ user: uid });
    let filesDeleted = 0;
    if (await deleteStoredFile(user.profileImage?.location, "profile_images"))
        filesDeleted += 1;
    if (user.profileImage?._id) {
        await profileImageModel.deleteOne({ _id: user.profileImage._id });
    }
    const idFiles = Array.isArray(user.observerId) ? user.observerId : [];
    for (const file of idFiles) {
        if (await deleteStoredFile(file?.location, "observer_ids"))
            filesDeleted += 1;
    }
    const idFileIds = idFiles.map((f) => f?._id).filter(Boolean);
    if (idFileIds.length)
        await observerIdModel.deleteMany({ _id: { $in: idFileIds } });
    return { pulsePostsDeleted, filesDeleted };
};
//# sourceMappingURL=accountDataPurge.js.map