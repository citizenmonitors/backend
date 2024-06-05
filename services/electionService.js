import Election from "../models/Election.js";
import path from "path";

export const createElectionRecord = async (data, user, files) => {
  const { year, type, results, ratedGood } = data;
  const election = new Election({
    year,
    type,
    results: JSON.parse(results),
    ratedGood,
    createdBy: user._id,
  });

 if (files.signedResultImage) {
   const ext = path
     .extname(files.signedResultImage[0].originalname)
     .toLowerCase();
   if (ext !== ".png") {
     throw new Error("Only PNG files are allowed for signed result image");
   }
   election.signedResultImage = files.signedResultImage[0].path;
 }

 if (files.resultAnnouncementVideo) {
   const ext = path
     .extname(files.resultAnnouncementVideo[0].originalname)
     .toLowerCase();
   if (ext !== ".mp4") {
     throw new Error(
       "Only MP4 files are allowed for result announcement video"
     );
   }
   election.resultAnnouncementVideo = files.resultAnnouncementVideo[0].path;
 }

  await election.save();
  return election;
};

export const getElections = async () => {
  return await Election.find().populate("createdBy", "email");
};

export const getElectionsByType = async (type) => {
  return await Election.find({ type }).populate("createdBy", "email");
};
