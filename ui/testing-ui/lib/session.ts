import { SessionOptions } from 'iron-session';

export interface SessionData {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  consents: {
    privacy: boolean;
    terms: boolean;
    safety: boolean;
  };
  metadata: {
    acceptedAt: string;
    ipAddress?: string;
  };
  isAccepted: boolean;
}

export const defaultSession: SessionData = {
  user: {
    firstName: '',
    lastName: '',
    email: '',
  },
  consents: {
    privacy: false,
    terms: false,
    safety: false,
  },
  metadata: {
    acceptedAt: '',
    ipAddress: '',
  },
  isAccepted: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'safety_testing_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  },
};

// Declare module augmentation for TypeScript
declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}
