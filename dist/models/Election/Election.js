import mongoose from "mongoose";
const ElectionSchema = new mongoose.Schema({
    electionType: {
        type: String,
        required: true,
    },
    electionName: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
export default mongoose.model("Election", ElectionSchema);
//# sourceMappingURL=Election.js.map