export interface SendEmailOptions {
    to: string;
    subject: string;
    htmlbody: string;
    textbody?: string;
    fromName?: string;
    /**
     * Adds RFC 2369 List-Unsubscribe and disables Zepto click/open tracking for this send.
     * Recommended for newsletters and bulk-style mail (helps some providers, e.g. Yahoo).
     */
    listUnsubscribeUrl?: string;
    trackClicks?: boolean;
    trackOpens?: boolean;
}
/**
 * Sends one email via ZeptoMail using fetch (avoids the official SDK bug that
 * crashes Node when an error response is not JSON-parseable).
 */
export declare const sendEmail: ({ to, subject, htmlbody, textbody, fromName, listUnsubscribeUrl, trackClicks, trackOpens, }: SendEmailOptions) => Promise<unknown>;
//# sourceMappingURL=email.d.ts.map