import mongoose from "mongoose";

const governmentIdSchema = new mongoose.Schema({
    location: String,
    name: String,
    type: String,
    size: Number,
    url:  String,
});

export {governmentIdSchema}
export default mongoose.model("GovernmentIdModel", governmentIdSchema);