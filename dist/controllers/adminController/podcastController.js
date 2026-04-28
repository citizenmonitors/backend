import * as PodcastService from "../../services/adminService/podcastService.js";
import { asParamString, isValidObjectId } from "../../utils/validators.js";
const getErrorMessage = (error) => error instanceof Error ? error.message : String(error);
export const sendPodcast = async (req, res) => {
    try {
        const adminId = req.user?._id;
        const podcast = await PodcastService.sendPodcastService({ adminId,
            ...req.body,
        });
        res.status(201).json(podcast);
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const editPodcast = async (req, res) => {
    try {
        const podcastId = asParamString(req.params.id);
        if (!isValidObjectId(podcastId)) {
            return res.status(400).json({ message: "Invalid podcast ID" });
        }
        const adminId = req.user?._id;
        const updates = req.body;
        const updatedPodcast = await PodcastService.editPodcastService({
            podcastId,
            updates,
            adminId,
        });
        res.status(200).json(updatedPodcast);
    }
    catch (error) {
        return res.status(400).json({ message: getErrorMessage(error) });
    }
};
export const getAllPodcasts = async (req, res) => {
    try {
        const podcasts = await PodcastService.getAllPodcastsService();
        res.status(200).json(podcasts);
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
export const getSinglePodcast = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid podcast ID" });
        }
        const userId = req.user?._id;
        const podcast = await PodcastService.getSinglePodcastService(id, userId);
        res.json(podcast);
    }
    catch (error) {
        return res.status(404).json({ message: getErrorMessage(error) });
    }
};
export const deletePodcast = async (req, res) => {
    try {
        const id = asParamString(req.params.id);
        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid podcast ID" });
        }
        const adminId = req.user?._id;
        const response = await PodcastService.deletePodcastService(id, adminId);
        res.json(response);
    }
    catch (error) {
        return res.status(404).json({ message: getErrorMessage(error) });
    }
};
export const getUserInbox = async (req, res) => {
    try {
        const userId = req.user?._id;
        const inbox = await PodcastService.getUserInboxService(userId);
        res.status(200).json({ inbox });
    }
    catch (error) {
        return res.status(500).json({
            message: "Failed to fetch inbox",
            error: getErrorMessage(error),
        });
    }
};
export const markPodcastAsRead = async (req, res) => {
    try {
        const podcastId = asParamString(req.params.podcastId);
        if (!isValidObjectId(podcastId)) {
            return res.status(400).json({ message: "Invalid podcast ID" });
        }
        const userId = req.user?._id;
        const result = await PodcastService.markPodcastAsReadService(podcastId, userId);
        res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ message: "Error marking podcast as read", error: getErrorMessage(error) });
    }
};
export const sendNewsletter = async (req, res) => {
    try {
        const { recipients, scheduleTime } = req.body;
        const newsletter = await PodcastService.sendNewsletterService({
            recipients,
            scheduleTime,
        });
        res.status(201).json({
            message: "Newsletter sent successfully",
            newsletter,
        });
    }
    catch (error) {
        return res.status(500).json({ message: getErrorMessage(error) });
    }
};
//# sourceMappingURL=podcastController.js.map