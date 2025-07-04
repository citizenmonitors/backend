import * as PodcastService from "../../services/adminService/podcastService.js";

export const sendPodcast = async (req, res) => {
  try {
   const adminId = req.user._id; 
    const podcast = await PodcastService.sendPodcastService({ adminId,
      ...req.body,
    });
    res.status(201).json(podcast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editPodcast = async (req, res) => {
    try {
      const adminId = req.user._id;
      const podcastId = req.params.id;
      const updates = req.body;
  
      const updatedPodcast = await PodcastService.editPodcastService({
        podcastId,
        updates,
        adminId,
      });
  
      res.status(200).json(updatedPodcast);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  

export const getAllPodcasts = async (req, res) => {
    try {
      const podcasts = await PodcastService.getAllPodcastsService();
      res.status(200).json(podcasts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

export const getSinglePodcast = async (req, res) => {
  try {
    const userId = req.user._id;
    const podcast = await PodcastService.getSinglePodcastService(req.params.id, userId);
    res.json(podcast);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deletePodcast = async (req, res) => {
  try {
   const adminId = req.user._id; 
    const response = await PodcastService.deletePodcastService(req.params.id, adminId);
    res.json(response);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserInbox = async (req, res) => {
  try {
    const userId = req.user._id;
    const inbox = await PodcastService.getUserInboxService(userId);
    res.status(200).json({ inbox });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch inbox",
      error: error.message,
    });
  }
};

export const markPodcastAsRead = async (req, res) => {
  try {
    const { podcastId } = req.params;
    const userId = req.user._id;

    const result = await PodcastService.markPodcastAsReadService(podcastId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error marking podcast as read", error: error.message });
  }
};


export const sendNewsletter = async (req, res) => {
  try {
    const { recipients } = req.body;
    const newsletter = await PodcastService.sendNewsletterService({
   
      recipients,
    });
    res.status(201).json({
      message: "Newsletter sent successfully",
      newsletter,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};