'use server';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const unprotectedRoutes = [
  '/api/auth/login',
  '/api/auth/verify',
];

export async function middleware(request: NextRequest) {
  const isUnprotectedRoute = unprotectedRoutes.includes(request.nextUrl.pathname);

  if (isUnprotectedRoute) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('auth');
  let isAuthenticated = false;

  if (authCookie) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jwtVerify(authCookie.value, secret);
      isAuthenticated = true;
    } catch (error) {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/(.*)',
  ],
};
