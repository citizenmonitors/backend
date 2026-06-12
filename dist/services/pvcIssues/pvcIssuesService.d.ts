type MulterMemoryFile = {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
};
type UploadFilesMap = Record<string, MulterMemoryFile | MulterMemoryFile[]>;
export type SubmitPvcIssuePayload = {
    fullName: string;
    phoneNumber: string;
    email?: string;
    state: string;
    lga: string;
    pollingUnit: string;
    issueType: string;
    otherIssueDetail?: string;
    description: string;
    consentText: string;
};
export type PvcIssuePublicResponse = {
    reportId: string;
    submittedAt: Date;
};
export declare const submitPvcIssueReport: (data: SubmitPvcIssuePayload, files: UploadFilesMap | undefined) => Promise<PvcIssuePublicResponse>;
export declare const listPvcIssueReports: () => Promise<{
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    state: string;
    lga: string;
    pollingUnit: string;
    issueType: string;
    otherIssueDetail: string;
    description: string;
    evidence: {
        index: number;
        name: string;
        type: string;
        size: number;
        url: string;
    }[];
    consentGiven: boolean;
    consentText: string;
    consentedAt: Date;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
}[]>;
export declare const getPvcIssueReportById: (id: string) => Promise<{
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    state: string;
    lga: string;
    pollingUnit: string;
    issueType: string;
    otherIssueDetail: string;
    description: string;
    evidence: {
        index: number;
        name: string;
        type: string;
        size: number;
        url: string;
    }[];
    consentGiven: boolean;
    consentText: string;
    consentedAt: Date;
    createdAt: Date | undefined;
    updatedAt: Date | undefined;
} | null>;
export {};
//# sourceMappingURL=pvcIssuesService.d.ts.map