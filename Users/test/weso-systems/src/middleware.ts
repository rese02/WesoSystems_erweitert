import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { initializeAdminApp } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

async function verifyToken(token: string) {
  try {
    const adminApp = initializeAdminApp();
    const auth = getAuth(adminApp);
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    // This is not an application error, just an invalid token.
    // console.warn('Middleware: Invalid auth token:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('firebaseIdToken');
  const token = tokenCookie?.value;

  const isApiAuthRoute = pathname.startsWith('/api/auth');
  const isPublicAsset = pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico');
  const isGuestRoute = pathname.startsWith('/guest');
  const isAgencyLogin = pathname === '/agency/login';
  const isHotelLogin = pathname === '/hotel/login';
  const isHomePage = pathname === '/';
  
  // Allow public routes and assets to pass through without authentication.
  if (isApiAuthRoute || isPublicAsset || isGuestRoute || isAgencyLogin || isHotelLogin || isHomePage) {
    return NextResponse.next();
  }

  // Define protected routes
  const isAgencyRoute = pathname.startsWith('/admin');
  const isHotelierRoute = pathname.startsWith('/dashboard');

  const targetLoginUrl = isAgencyRoute ? '/agency/login' : '/hotel/login';
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = targetLoginUrl;

  // If there's no token for a protected route, redirect to the appropriate login page.
  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  const decodedToken = await verifyToken(token);

  // If the token is invalid, redirect to login and clear the bad cookie.
  if (!decodedToken) {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('firebaseIdToken');
    return response;
  }

  const { role, hotelId } = decodedToken;

  // Agency access control
  if (isAgencyRoute) {
    if (role !== 'agency') {
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('firebaseIdToken');
      return response;
    }
  }

  // Hotelier access control
  else if (isHotelierRoute) {
    const requestedHotelId = pathname.split('/')[2];
    if (role !== 'hotelier' || hotelId !== requestedHotelId) {
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('firebaseIdToken');
      return response;
    }
  }

  // If no specific protected route matched, but a token exists, the user might be trying to access a non-existent page
  // or a page they shouldn't. Redirecting to their respective login page is a safe default.
  // However, we let Next.js handle 404s, so we just continue.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (but we handle /api/auth specifically)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * This updated matcher is more explicit about what's public.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
