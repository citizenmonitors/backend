import path from "path";
import PvcIssuesReport from "../../models/PvcIssues/pvcIssuesReport.js";
import { uploadFileToFirebase } from "../../config/firebaseUploader.js";
import { sendEmail } from "../../config/email.js";
import { pvcIssueAcknowledgementTemplate, pvcIssueInternalNotificationTemplate, } from "../../config/emailTemplates.js";
import { normalizeNigerianPhone } from "../../validators/pvcIssuesValidators.js";
const DEFAULT_NOTIFY_EMAILS = ["support@citizenmonitors.com"];
const getNotifyEmails = () => {
    const env = process.env.PVC_ISSUES_NOTIFY_EMAILS;
    if (env && typeof env === "string") {
        return env.split(",").map((e) => e.trim()).filter(Boolean);
    }
    return DEFAULT_NOTIFY_EMAILS;
};
const allowedEvidenceExtensions = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];
const collectEvidenceFiles = (files) => {
    if (!files)
        return [];
    const fromArray = files["evidence[]"];
    const fromSingle = files.evidence;
    const combined = [
        ...(Array.isArray(fromArray) ? fromArray : fromArray ? [fromArray] : []),
        ...(Array.isArray(fromSingle) ? fromSingle : fromSingle ? [fromSingle] : []),
    ];
    return combined;
};
const validateEvidenceFile = (file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedEvidenceExtensions.includes(ext)) {
        throw new Error(`Invalid file type for ${file.originalname}. Allowed: images and PDFs only.`);
    }
    if (file.size > 5 * 1024 * 1024) {
        throw new Error(`Each file must be 5MB or less (${file.originalname}).`);
    }
};
const uploadEvidenceFiles = async (files) => {
    const uploads = files.map(async (file) => {
        validateEvidenceFile(file);
        const { publicUrl, filePath, token } = await uploadFileToFirebase(file, "pvc_issues_evidence");
        return {
            location: filePath,
            name: file.originalname,
            type: file.mimetype,
            size: file.size,
            url: publicUrl,
            token,
        };
    });
    return Promise.all(uploads);
};
export const submitPvcIssueReport = async (data, files) => {
    const evidenceFiles = collectEvidenceFiles(files);
    const evidence = evidenceFiles.length
        ? await uploadEvidenceFiles(evidenceFiles)
        : [];
    const report = await PvcIssuesReport.create({
        fullName: data.fullName.trim(),
        phoneNumber: normalizeNigerianPhone(data.phoneNumber),
        email: data.email?.trim() ?? "",
        state: data.state.trim(),
        lga: data.lga.trim(),
        pollingUnit: data.pollingUnit.trim(),
        issueType: data.issueType,
        otherIssueDetail: data.issueType === "Other" ? (data.otherIssueDetail?.trim() ?? "") : "",
        description: data.description.trim(),
        evidence,
        consentGiven: true,
        consentText: data.consentText.trim(),
        consentedAt: new Date(),
    });
    const reportId = String(report._id);
    const submittedAt = report.createdAt ?? new Date();
    if (data.email?.trim()) {
        await sendEmail({
            to: data.email.trim(),
            subject: "Your PVC issue report has been received – Citizen Monitors",
            htmlbody: pvcIssueAcknowledgementTemplate({
                fullName: data.fullName.trim(),
                reportId,
            }),
        }).catch((error) => {
            console.error("PVC issue acknowledgement email failed:", error);
        });
    }
    const notifyEmails = getNotifyEmails();
    if (notifyEmails.length) {
        await sendEmail({
            to: notifyEmails.join(","),
            subject: `New PVC issue report – ${data.state} / ${data.lga}`,
            htmlbody: pvcIssueInternalNotificationTemplate({
                reportId,
                fullName: data.fullName.trim(),
                phoneNumber: normalizeNigerianPhone(data.phoneNumber),
                email: data.email?.trim() ?? "",
                state: data.state.trim(),
                lga: data.lga.trim(),
                pollingUnit: data.pollingUnit.trim(),
                issueType: data.issueType,
                otherIssueDetail: data.otherIssueDetail?.trim() ?? "",
                description: data.description.trim(),
                evidenceCount: evidence.length,
            }),
        }).catch((error) => {
            console.error("PVC issue internal notification email failed:", error);
        });
    }
    return { reportId, submittedAt };
};
const sanitizeReportForAdmin = (report) => ({
    id: String(report._id),
    fullName: report.fullName,
    phoneNumber: report.phoneNumber,
    email: report.email ?? "",
    state: report.state,
    lga: report.lga,
    pollingUnit: report.pollingUnit,
    issueType: report.issueType,
    otherIssueDetail: report.otherIssueDetail ?? "",
    description: report.description,
    evidence: (report.evidence ?? []).map((file, index) => ({
        index,
        name: file.name ?? "",
        type: file.type ?? "",
        size: file.size ?? 0,
        url: file.url ?? "",
    })),
    consentGiven: report.consentGiven,
    consentText: report.consentText,
    consentedAt: report.consentedAt,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
});
export const listPvcIssueReports = async () => {
    const items = await PvcIssuesReport.find().sort({ createdAt: -1 }).lean();
    return items.map((report) => sanitizeReportForAdmin(report));
};
export const getPvcIssueReportById = async (id) => {
    const report = (await PvcIssuesReport.findById(id).lean());
    if (!report)
        return null;
    return sanitizeReportForAdmin(report);
};
//# sourceMappingURL=pvcIssuesService.js.map