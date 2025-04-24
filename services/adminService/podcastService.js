import AdminLog from "../../models/admin/AdminLog.js";
import Podcast from "../../models/admin/Podcast.js";
import CompletedUser from "../../models/CompletedUser.js";


export const sendPodcastService = async ({ title, content, recipients, adminId }) => {
    // Normalize recipients to an array
    if (typeof recipients === "string") {
      recipients = [recipients];
    }
  
    // Validation: don't mix 'all' with other roles
    if (recipients.includes("all") && recipients.length > 1) {
      throw new Error("Cannot combine 'all' with specific roles. Choose either 'all' or specific roles.");
    }
  
    const podcast = await Podcast.create({ title, content, recipients, sender: adminId });
  
    // Count estimated recipients
    let totalTargetedUsers = 0;
    for (const role of recipients) {
      if (role === "all") {
        totalTargetedUsers += await CompletedUser.countDocuments();
      } else {
        totalTargetedUsers += await CompletedUser.countDocuments({ role });
      }
    }
  
    await AdminLog.create({
      admin: adminId,
      action: "Sent Podcast",
      details: {
        title,
        contentPreview: content.slice(0, 50),
        recipients,
        estimatedRecipients: totalTargetedUsers,
      },
      timestamp: new Date(),
    });
  
    return podcast;
  };
  
  export const editPodcastService = async ({ podcastId, updates, adminId }) => {
    const { title, content, recipients,  } = updates;
    const updateFields = {};
  
    if (title) updateFields.title = title;
    if (content) updateFields.content = content;
  
    if (recipients) {
      const normalized = typeof recipients === "string" ? [recipients] : recipients;
      if (normalized.includes("all") && normalized.length > 1) {
        throw new Error("Cannot combine 'all' with specific roles. Choose either 'all' or specific roles.");
      }
      updateFields.recipients = normalized;
    }
  
    const podcast = await Podcast.findByIdAndUpdate(
      podcastId,
      { $set: updateFields },
      { new: true }
    );
  
    if (!podcast) throw new Error("Podcast not found");
  
    await AdminLog.create({
      admin: adminId,
      action: "Edited Podcast",
      details: {
        podcastId,
        updates: updateFields,
      },
      timestamp: new Date(),
    });
  
    return podcast;
  };
  

// export const getAllPodcastsService = async (query) => {
//   const { page = 1, limit = 10 } = query;
//   const skip = (page - 1) * limit;

//   const podcasts = await Podcast.find()
//     .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//   const totalPodcasts = await Podcast.countDocuments();
//   const totalPages = Math.ceil(totalPodcasts / limit);

//   return {
//     podcasts,
//     totalPages,
//     currentPage: Number(page),
//     totalPodcasts,
//   };
// };

export const getAllPodcastsService = async () => {
    return await Podcast.find().sort({ createdAt: -1 });
  };
  

export const getSinglePodcastService = async (id) => {
  const podcast = await Podcast.findById(id);
  if (!podcast) throw new Error("Podcast not found");

  const { readBy, ...podcastWithoutReadBy } = podcast.toObject();
  return podcastWithoutReadBy;
};

export const deletePodcastService = async (id, adminId) => {
  const deleted = await Podcast.findByIdAndDelete(id);
  if (!deleted) throw new Error("Podcast not found");
  // Log the admin action
  await AdminLog.create({
    admin: adminId,
    action: "Delete Podcast",
    details: {
        podcastId: id,
    },
    timestamp: new Date(),
  });
  return { message: "Podcast deleted successfully" };
};

export const getUserInboxService = async (userId) => {
  const user = await CompletedUser.findById(userId).lean();
  if (!user || !user.role) throw new Error("User not found or role missing");

  const role = user.role.toLowerCase();

  const inbox = await Podcast.find({
    recipients: { $in: ["all", role] },
  })
    .sort({ createdAt: -1 })
    .lean();

    const inboxWithReadStatus = inbox.map((podcast) => {
      const read = podcast.readBy
        ? podcast.readBy.some(
            (readerId) => readerId.toString() === userId.toString()
          )
        : false;
    
      const { readBy, ...podcastWithoutReadBy } = podcast;
    
      return { ...podcastWithoutReadBy, read };
    });

  
    return inboxWithReadStatus;
};


export const markPodcastAsReadService = async (podcastId, userId) => {
  const podcast = await Podcast.findById(podcastId);
  if (!podcast) throw new Error("Podcast not found");

  const alreadyRead = podcast.readBy.some(
    (readerId) => readerId.toString() === userId.toString()
  );

  if (!alreadyRead) {
    podcast.readBy.push(userId);
    await podcast.save();
  }

  return { message: "Podcast marked as read" };
};
