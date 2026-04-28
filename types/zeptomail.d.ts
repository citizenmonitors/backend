declare module "zeptomail" {
  export type SendMailClientOptions = Record<string, unknown>;
  export type SendMailPayload = Record<string, unknown>;
  export class SendMailClient {
    constructor(options: SendMailClientOptions);
    sendMail(payload: SendMailPayload): Promise<unknown>;
  }
}

