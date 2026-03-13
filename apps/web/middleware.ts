import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/features',
  '/pricing',
  '/demo',
];

const apiAuthPaths = [
  '/api/auth/oauth',
  '/api/auth/login',
  '/api/auth/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  const isAuthApiPath = apiAuthPaths.some(path => 
    pathname.startsWith(path)
  );

  if (isPublicPath || isAuthApiPath) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('auth_token');

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
