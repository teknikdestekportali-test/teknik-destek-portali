import { NextRequest, NextResponse } from 'next/server';
import { validateKKMCredentials, generateKKMSessionToken, KKM_SESSION_COOKIE } from '@/lib/kkm-auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!validateKKMCredentials(username, password)) {
    return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı.' }, { status: 401 });
  }

  const token = generateKKMSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(KKM_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  });
  return response;
}
