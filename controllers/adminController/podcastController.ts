import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../types/authenticatedRequest.ts";
import * as PodcastService from "../../services/adminService/podcastService.ts";
import { asParamString, isValidObjectId } from "../../utils/validators.ts";

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const sendPodcast = async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthenticatedRequest).user?._id;
    const podcast = await PodcastService.sendPodcastService({ adminId,
      ...req.body,
    });
    res.status(201).json(podcast);
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) });
  }
};

export const editPodcast = async (req: Request, res: Response) => {
    try {
      const podcastId = asParamString(req.params.id);
      if (!isValidObjectId(podcastId)) {
        return res.status(400).json({ message: "Invalid podcast ID" });
      }
      const adminId = (req as AuthenticatedRequest).user?._id;
      const updates = req.body;
  
      const updatedPodcast = await PodcastService.editPodcastService({
        podcastId,
        updates,
        adminId,
      });
  
      res.status(200).json(updatedPodcast);
    } catch (error) {
      return res.status(400).json({ message: getErrorMessage(error) });
    }
  };
  

export const getAllPodcasts = async (req: Request, res: Response) => {
    try {
      const podcasts = await PodcastService.getAllPodcastsService();
      res.status(200).json(podcasts);
    } catch (error) {
      return res.status(500).json({ message: getErrorMessage(error) });
    }
  };
  

export const getSinglePodcast = async (req: Request, res: Response) => {
  try {
    const id = asParamString(req.params.id);
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid podcast ID" });
    }
    const userId = (req as AuthenticatedRequest).user?._id;
    const podcast = await PodcastService.getSinglePodcastService(id, userId);
    res.json(podcast);
  } catch (error) {
    return res.status(404).json({ message: getErrorMessage(error) });
  }
};

export const deletePodcast = async (req: Request, res: Response) => {
  try {
   const id = asParamString(req.params.id);
   if (!isValidObjectId(id)) {
     return res.status(400).json({ message: "Invalid podcast ID" });
   }
   const adminId = (req as AuthenticatedRequest).user?._id;
    const response = await PodcastService.deletePodcastService(id, adminId);
    res.json(response);
  } catch (error) {
    return res.status(404).json({ message: getErrorMessage(error) });
  }
};

export const getUserInbox = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?._id;
    const inbox = await PodcastService.getUserInboxService(userId);
    res.status(200).json({ inbox });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch inbox",
      error: getErrorMessage(error),
    });
  }
};

export const markPodcastAsRead = async (req: Request, res: Response) => {
  try {
    const podcastId = asParamString(req.params.podcastId);
    if (!isValidObjectId(podcastId)) {
      return res.status(400).json({ message: "Invalid podcast ID" });
    }
    const userId = (req as AuthenticatedRequest).user?._id;

    const result = await PodcastService.markPodcastAsReadService(podcastId, userId);
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Error marking podcast as read", error: getErrorMessage(error) });
  }
};


export const sendNewsletter = async (req: Request, res: Response) => {
  try {
    const {
      recipients,
      scheduleTime,
      sendEmail,
      publishAsNewsInsight,
      isTest,
      testEmails,
      paste,
      title,
      content,
      excerpt,
      thumbnailURLUrl,
    } = req.body;
    const adminId = (req as AuthenticatedRequest).user?._id;
    const newsletter = await PodcastService.sendNewsletterService({
      recipients,
      scheduleTime,
      adminId,
      sendEmail,
      publishAsNewsInsight,
      isTest,
      testEmails,
      paste,
      title,
      content,
      excerpt,
      thumbnailURLUrl,
    });
    res.status(201).json(newsletter);
  } catch (error) {
    const message = getErrorMessage(error);
    if (
      message.includes("required") ||
      message.includes("Invalid") ||
      message.includes("Nothing to do") ||
      message.includes("No newsletter recipients") ||
      message.includes("must be in the future") ||
      message.includes("Could not find a subject") ||
      message.includes("Send `paste`") ||
      message.includes("paste body")
    ) {
      return res.status(400).json({ message });
    }
    return res.status(500).json({ message });
  }
};

/**
 * Compose page: paste draft → preview newsletter email + News & Insight HTML.
 * POST /api/admin/newsletter/preview
 */
export const previewNewsletterCompose = async (req: Request, res: Response) => {
  try {
    const { paste, title, content, excerpt, thumbnailURLUrl } = req.body ?? {};
    const preview = await PodcastService.composeNewsletterPreviewService({
      paste,
      title,
      content,
      excerpt,
      thumbnailURLUrl,
    });
    return res.status(200).json(preview);
  } catch (error) {
    const message = getErrorMessage(error);
    if (
      message.includes("required") ||
      message.includes("Could not find a subject") ||
      message.includes("Send `paste`") ||
      message.includes("paste body")
    ) {
      return res.status(400).json({ message });
    }
    return res.status(500).json({ message });
  }
};

/** GET active hardcoded edition preview (fallback). */
export const getActiveNewsletter = async (_req: Request, res: Response) => {
  try {
    const preview = await PodcastService.getActiveNewsletterPreviewService();
    return res.status(200).json(preview);
  } catch (error) {
    return res.status(500).json({ message: getErrorMessage(error) });
  }
};