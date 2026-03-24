import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'workshop_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/workshop') && !pathname.startsWith('/workshop/login')) {
    const session = request.cookies.get(SESSION_COOKIE);
    if (!session?.value) {
      return NextResponse.redirect(new URL('/workshop/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/workshop/:path*'],
};
