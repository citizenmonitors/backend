import mongoose from "mongoose";

const profileImageSchema = new mongoose.Schema({
  location: String,
  name: String,
  type: String,
  size: Number,
  url: String,
});

export { profileImageSchema };
export default mongoose.model("ProfileImageModel", profileImageSchema);

