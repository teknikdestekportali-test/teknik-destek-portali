import crypto from 'crypto';

export const KKM_SESSION_COOKIE = 'kkm_session';

export function generateKKMSessionToken(): string {
  const secret = process.env.KKM_SESSION_SECRET ?? 'kkm-demo-secret';
  const user = process.env.KKM_USERNAME ?? 'kkm';
  return crypto.createHmac('sha256', secret).update(user).digest('hex');
}

export function validateKKMCredentials(username: string, password: string): boolean {
  return (
    username === (process.env.KKM_USERNAME ?? 'kkm') &&
    password === (process.env.KKM_PASSWORD ?? 'kkm1234')
  );
}

export function isValidKKMSession(token: string): boolean {
  return token === generateKKMSessionToken();
}
