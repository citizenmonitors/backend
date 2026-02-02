import { sendEmail } from "../../config/email.js";
import { newsLetterTemplateUpcoming, podcastNotificationTemplate } from "../../config/emailTemplates.js";
import schedule from "node-schedule";
import { utcToZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import AdminLog from "../../models/admin/AdminLog.js";
import Podcast from "../../models/admin/Podcast.js";
import CompletedUser from "../../models/CompletedUser.js";



  export const sendPodcastService = async ({ title, content, recipients, adminId }) => {
    const normalizedRecipients = typeof recipients === "string" ? [recipients] : recipients;
  
    if (normalizedRecipients.includes("all") && normalizedRecipients.length > 1) {
      throw new Error("Cannot combine 'all' with specific roles. Choose either 'all' or specific roles.");
    }
  
    const podcast = await Podcast.create({
      title,
      content,
      recipients: normalizedRecipients,
      sender: adminId,
    });
  
    const userQueries = normalizedRecipients.map((role) => {
      const query = { "notifications.email.inbox": true };
      if (role !== "all") {
        query.role = role;
      }
      return CompletedUser.find(query, "email").lean();
    });
  
    const usersGroups = await Promise.all(userQueries);
    const allUserEmails = usersGroups.flat().map((user) => user.email);
    // const allUserEmails = ["yunusmustapha2@gmail.com"];
    const totalTargetedUsers = allUserEmails.length;
  
    const htmlcontent = podcastNotificationTemplate(title, content);

    const emailPromises = allUserEmails.map((email) =>
      sendEmail({
        from: process.env.ZEPTO_FROM_EMAIL,
        to: email,
        subject: `New Podcast: ${title}`,
        htmlbody: htmlcontent,
      }).catch((err) => {
        console.error(`Failed to send email to ${email}:`, err);
      })
    );
  
    await Promise.all(emailPromises);
  
    await AdminLog.create({
      admin: adminId,
      action: "Sent Podcast",
      details: {
        title,
        contentPreview: content.slice(0, 50),
        recipients: normalizedRecipients,
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
  

export const getAllPodcastsService = async () => {
    return await Podcast.find().sort({ createdAt: -1 });
  };
  

  export const getSinglePodcastService = async (id, userId) => {
    const user = await CompletedUser.findById(userId).lean();
    if (!user || !user.role) throw new Error("User not found or role missing");
  
    const role = user.role.toLowerCase();
  
    const podcastWithoutReadBy = await Podcast.findById(id).lean();
    if (!podcastWithoutReadBy) throw new Error("Podcast not found");
  
    // Check if user's role is among recipients
    if (!podcastWithoutReadBy.recipients.includes("all") && !podcastWithoutReadBy.recipients.includes(role)) {
      throw new Error("You do not have access to this podcast.");
    }
  
    // Exclude readBy before returning
    const { readBy, ...podcast } = podcastWithoutReadBy;
    return podcast;
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

    const  podcast= inbox.map((inboxWithReadStatus) => {
      const read = inboxWithReadStatus.readBy
        ? inboxWithReadStatus.readBy.some(
            (readerId) => readerId.toString() === userId.toString()
          )
        : false;
    
      const { readBy, ...podcastWithoutReadBy } = inboxWithReadStatus;
    
      return { ...podcastWithoutReadBy, read };
    });

  
    return podcast;
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


export const sendNewsletterService = async ({ recipients, scheduleTime }) => {
  // Normalize recipients to an array
  if (typeof recipients === "string") {
    recipients = [recipients];
  }

  // Validation: don't mix 'all' with other roles
  if (recipients.includes("all") && recipients.length > 1) {
    throw new Error("Cannot combine 'all' with specific roles. Choose either 'all' or specific roles.");
  }

  const sendEmails = async () => {
    // Count estimated recipients and fetch their email addresses
    let totalTargetedUsers = 0;
    let userEmails = [];
    for (const role of recipients) {
      let completedUsers;

      if (role === "all") {
        // Fetch emails from CompletedUser model where notifications.email.newsletter is true
        completedUsers = await CompletedUser.find({ "notifications.email.newsletter": true }, "email").lean();
      } else {
        // Fetch emails by role from CompletedUser model where notifications.email.newsletter is true
        completedUsers = await CompletedUser.find({ role, "notifications.email.newsletter": true }, "email").lean();
      }

      totalTargetedUsers += completedUsers.length;
      userEmails.push(...completedUsers.map((user) => user.email));
    }
  

    // For testing, override userEmails with your email
    userEmails = ["yunusmustapha2@gmail.com", "citizenmonitors@yahoo.com", "oluwaloninyo@yahoo.com"]; 

  

    const htmlContent = newsLetterTemplateUpcoming();

    // Send emails to all targeted users
    const emailPromises = userEmails.map((email) =>
      sendEmail({
        from: process.env.ZEPTO_FROM_EMAIL,
        to: email,
        subject: `Citizen Monitors Weekly Newsletter`,
        htmlbody: htmlContent,
      }).catch((err) => {
        console.error(`Failed to send email to ${email}:`, err);
      })
    );

    await Promise.all(emailPromises);

    console.log(`Newsletter sent successfully to ${userEmails.length} recipients.`);
    return { totalRecipients: userEmails.length };
  };

  if (scheduleTime) {
    // Convert scheduleTime to Nigeria time zone
    const nigeriaTimeZone = "Africa/Lagos";
    const nigeriaTime = utcToZonedTime(new Date(scheduleTime), nigeriaTimeZone);
    const formattedTime = format(nigeriaTime, "yyyy-MM-dd HH:mm:ssXXX", { timeZone: nigeriaTimeZone });

    // Schedule the email sending
    schedule.scheduleJob(nigeriaTime, async () => {
      console.log(`Scheduled newsletter sending at ${formattedTime} (Nigeria Time)`);
      await sendEmails();
    });

    return { message: "Newsletter scheduled successfully", scheduleTime: formattedTime };
  } else {
    // Send immediately if no scheduleTime is provided
    const result = await sendEmails();
    return { message: "Newsletter sent successfully", ...result };
  }
};
