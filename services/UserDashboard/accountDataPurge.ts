/**
 * Data handling for account deletion (self-service and admin).
 *
 * - Observer election results/incidents are kept for collation but anonymised
 *   (`user: null`, `uploaderDeleted: true`).
 * - Everything else the person created or that identifies them is removed:
 *   Pulse content, discussion and article comments, likes, notifications aimed only at
 *   them, feedback, and their profile image and observer ID files in storage.
 */
import mongoose, { type Types } from "mongoose";
import ElectionData from "../../models/Election/ElectionData.ts";
import IncidentReport from "../../models/Election/IncidentReport.ts";
import PulsePost from "../../models/Pulse/PulsePost.ts";
import PulseComment from "../../models/Pulse/PulseComment.ts";
import UserBlock from "../../models/Pulse/UserBlock.ts";
import CollationDiscussionPost from "../../models/Election/CollationDiscussionPost.ts";
import CollationDiscussionComment from "../../models/Election/CollationDiscussionComment.ts";
import CollationReportComment from "../../models/Election/CollationReportComment.ts";
import NewsInsight from "../../models/admin/NewsInsight.ts";
import NewsInsightComment from "../../models/admin/NewsInsightComment.ts";
import PressCoverage from "../../models/admin/PressCoverage.ts";
import PressCoverageComment from "../../models/admin/PressCoverageComment.ts";
import Notification from "../../models/DailyTraffic/Notification.ts";
import Podcast from "../../models/admin/Podcast.ts";
import MobileFeedback from "../../models/Feedback/mobileFeedback.ts";
import profileImageModel from "../../models/UserProfileImage/ProfileImageModel.ts";
import observerIdModel from "../../models/observerIds/observerIdModel.ts";
import bucket from "../../config/firebaseConfig.ts";
import { deletePulsePostCore } from "../mobile/pulseService.ts";

type Id = Types.ObjectId | string;

type StoredFile = { _id?: unknown; location?: string | null } | null | undefined;

export type PurgeableUser = {
  _id: Id;
  profileImage?: StoredFile;
  observerId?: StoredFile[] | null;
};

/** Keep observer uploads for collation, without anything linking them to the person. */
export const anonymizeUserSubmissions = async (userId: Id) => {
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

const deleteStoredFile = async (location: string | null | undefined, folder: string) => {
  const path = String(location ?? "").trim();
  // Only touch files we uploaded to Firebase Storage; ignore URLs and legacy local paths.
  if (!path.startsWith(`${folder}/`)) return false;
  try {
    const file = bucket.file(path);
    const [exists] = await file.exists();
    if (!exists) return false;
    await file.delete();
    return true;
  } catch (error) {
    console.error(`Account deletion: could not delete ${path}:`, error);
    return false;
  }
};

const deletePulseContent = async (uid: Types.ObjectId) => {
  // Posts one at a time so reposts, quotes and counters on other posts stay consistent.
  const posts = await PulsePost.find({ author: uid }).select("_id").lean();
  for (const { _id } of posts) {
    const post = await PulsePost.findById(_id).select("_id repostedFrom isQuote").lean();
    if (post) await deletePulsePostCore(post);
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

const deleteDiscussionAndCommentContent = async (uid: Types.ObjectId) => {
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
  await Promise.all(
    [
      CollationDiscussionPost,
      CollationDiscussionComment,
      CollationReportComment,
      NewsInsight,
      NewsInsightComment,
      PressCoverage,
      PressCoverageComment,
    ].map((model) =>
      (model as unknown as mongoose.Model<unknown>).updateMany({ "likes.user": uid }, likePull)
    )
  );
};

const deleteNotificationTraces = async (uid: Types.ObjectId) => {
  // A notification aimed only at this person goes. Pulling the last id instead would
  // leave targetUsers empty, which means "visible to everyone".
  await Notification.deleteMany({ targetUsers: { $size: 1, $all: [uid] } });
  await Notification.updateMany(
    { $or: [{ targetUsers: uid }, { readBy: uid }, { deletedBy: uid }] },
    { $pull: { targetUsers: uid, readBy: uid, deletedBy: uid } }
  );
  await Podcast.updateMany({ readBy: uid }, { $pull: { readBy: uid } });
};

/** Remove everything personal or user-generated, other than election submissions. */
export const purgeUserPersonalContent = async (user: PurgeableUser) => {
  const uid = new mongoose.Types.ObjectId(String(user._id));

  const pulsePostsDeleted = await deletePulseContent(uid);
  await deleteDiscussionAndCommentContent(uid);
  await deleteNotificationTraces(uid);
  await MobileFeedback.deleteMany({ user: uid });

  let filesDeleted = 0;
  if (await deleteStoredFile(user.profileImage?.location, "profile_images")) filesDeleted += 1;
  if (user.profileImage?._id) {
    await profileImageModel.deleteOne({ _id: user.profileImage._id });
  }
  const idFiles = Array.isArray(user.observerId) ? user.observerId : [];
  for (const file of idFiles) {
    if (await deleteStoredFile(file?.location, "observer_ids")) filesDeleted += 1;
  }
  const idFileIds = idFiles.map((f) => f?._id).filter(Boolean);
  if (idFileIds.length) await observerIdModel.deleteMany({ _id: { $in: idFileIds } });

  return { pulsePostsDeleted, filesDeleted };
};
