export interface GmailError {
  type: 'AUTH_ERROR' | 'NETWORK_ERROR' | 'API_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: any;
}

export interface Email {
  messageId: string;
  threadId: string;
  subject: string;
  sender: string;
  to: string;
  preview: {
    body: string;
    subject: string;
  };
  messageTimestamp: string;
}

export interface VerificationCode {
  messageId: string;
  threadId: string;
  sender: string;
  subject: string;
  code: string;
  timestamp: string;
  body: string;
  expiryTime?: string;
}

export interface VerificationLink {
  id: string;
  messageId: string;
  threadId: string;
  sender: string;
  subject: string;
  link: string;
  linkText: string;
  timestamp: string;
  isSafe?: boolean;
} 