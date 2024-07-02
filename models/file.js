import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  location: String,
  name: String,
  type: String,
  size: Number,
});
export { fileSchema };
export default mongoose.model("File", fileSchema);
