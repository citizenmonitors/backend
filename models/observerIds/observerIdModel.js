import mongoose from "mongoose";

const observerIdSchema = new mongoose.Schema({
    location: String,
    name: String,
    type: String,
    size: Number,
    url:  String,
});

export {observerIdSchema}
export default mongoose.model("observerIdModel", observerIdSchema);