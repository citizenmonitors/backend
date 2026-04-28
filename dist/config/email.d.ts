export interface SendEmailOptions {
    to: string;
    subject: string;
    htmlbody: string;
    textbody?: string;
    fromName?: string;
}
export declare const sendEmail: ({ to, subject, htmlbody, textbody, fromName, }: SendEmailOptions) => Promise<unknown>;
//# sourceMappingURL=email.d.ts.map