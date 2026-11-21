export type MailboxMessage = {
  from: string;
  subject: string;
  text: string;
  html?: string;
};

export type WaitForMessageOptions = {
  to: string;
  subject?: string;
  timeoutMs?: number;
};

export interface Mailbox {
  waitForMessage(options: WaitForMessageOptions): Promise<MailboxMessage>;
}
