import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/admin';

async function verifyToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.warn('Middleware: Invalid auth token:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('firebaseIdToken');
  const token = tokenCookie?.value;

  const isAgencyRoute = pathname.startsWith('/admin');
  const isHotelierRoute = pathname.startsWith('/dashboard');

  // Allow unauthenticated access to login pages and the main page
  if (pathname === '/' || pathname.startsWith('/guest') || pathname.startsWith('/agency/login') || pathname.startsWith('/hotel/login')) {
    return NextResponse.next();
  }

  // If there's no token, redirect to the appropriate login page
  if (!token) {
    const loginUrl = isAgencyRoute ? '/agency/login' : '/hotel/login';
    const url = request.nextUrl.clone();
    url.pathname = loginUrl;
    return NextResponse.redirect(url);
  }

  const decodedToken = await verifyToken(token);

  if (!decodedToken) {
    const loginUrl = isAgencyRoute ? '/agency/login' : '/hotel/login';
    const url = request.nextUrl.clone();
    url.pathname = loginUrl;
    // Clear the invalid cookie
    const response = NextResponse.redirect(url);
    response.cookies.delete('firebaseIdToken');
    return response;
  }

  const { role, hotelId } = decodedToken;

  // Agency access control
  if (isAgencyRoute) {
    if (role !== 'agency') {
      const url = request.nextUrl.clone();
      url.pathname = '/agency/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('firebaseIdToken');
      return response;
    }
  }

  // Hotelier access control
  if (isHotelierRoute) {
    const requestedHotelId = pathname.split('/')[2];
    if (role !== 'hotelier' || hotelId !== requestedHotelId) {
      const url = request.nextUrl.clone();
      url.pathname = '/hotel/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('firebaseIdToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
