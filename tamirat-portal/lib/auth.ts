import crypto from 'crypto';

export function generateSessionToken(): string {
  const secret = process.env.WORKSHOP_SESSION_SECRET ?? 'demo-secret';
  const user = process.env.WORKSHOP_USERNAME ?? 'atolye';
  return crypto.createHmac('sha256', secret).update(user).digest('hex');
}

export function validateCredentials(username: string, password: string): boolean {
  return (
    username === (process.env.WORKSHOP_USERNAME ?? 'atolye') &&
    password === (process.env.WORKSHOP_PASSWORD ?? 'demo1234')
  );
}

export function isValidSession(token: string): boolean {
  return token === generateSessionToken();
}

export const SESSION_COOKIE = 'workshop_session';
