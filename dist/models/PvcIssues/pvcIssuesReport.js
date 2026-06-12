import mongoose from "mongoose";
import { fileSchema } from "../file.js";
export const PVC_ISSUE_TYPES = [
    "Marked as 'Unknown' in the voters roll despite valid registration",
    "PVC not available at collection centre",
    "PVC collection point inaccessible / unreasonably far",
    "Biometric data mismatch or capture failure",
    "Registration completed but PVC never issued",
    "PVC defaced or damaged",
    "Other",
];
const pvcIssuesReportSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    state: { type: String, required: true, trim: true },
    lga: { type: String, required: true, trim: true },
    pollingUnit: { type: String, required: true, trim: true },
    issueType: {
        type: String,
        required: true,
        enum: PVC_ISSUE_TYPES,
    },
    otherIssueDetail: { type: String, trim: true, default: "" },
    description: { type: String, required: true, trim: true },
    evidence: [fileSchema],
    consentGiven: { type: Boolean, required: true },
    consentText: { type: String, required: true },
    consentedAt: { type: Date, required: true },
}, { timestamps: true, collection: "pvc_issues_reports" });
pvcIssuesReportSchema.index({ state: 1, lga: 1, issueType: 1, createdAt: -1 });
pvcIssuesReportSchema.index({ createdAt: -1 });
export default mongoose.model("PvcIssuesReport", pvcIssuesReportSchema);
//# sourceMappingURL=pvcIssuesReport.js.map