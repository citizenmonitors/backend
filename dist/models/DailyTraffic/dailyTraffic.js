import mongoose from "mongoose";
const TrafficSchema = new mongoose.Schema({
    date: {
        type: Date,
        unique: true,
        required: true,
    },
    visitCount: {
        type: Number,
        default: 0,
        required: true,
    },
});
const Traffic = mongoose.model("Traffic", TrafficSchema);
export default Traffic;
//# sourceMappingURL=dailyTraffic.js.map