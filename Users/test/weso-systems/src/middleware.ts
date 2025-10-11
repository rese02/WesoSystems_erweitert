import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { initializeAdminApp } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

async function verifyToken(token: string) {
  try {
    const adminApp = initializeAdminApp();
    const auth = getAuth(adminApp);
    const decodedToken = await auth.verifySessionCookie(token, true);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const token = sessionCookie?.value;

  const isApiRoute = pathname.startsWith('/api/');
  const isPublicAsset = pathname.startsWith('/_next/') || /\..*$/.test(pathname);
  const isGuestRoute = pathname.startsWith('/guest');
  const isAgencyLogin = pathname === '/agency/login';
  const isHotelLogin = pathname === '/hotel/login';
  const isHomePage = pathname === '/';
  
  if (isApiRoute || isPublicAsset || isGuestRoute || isAgencyLogin || isHotelLogin || isHomePage) {
    return NextResponse.next();
  }

  const isAgencyRoute = pathname.startsWith('/admin');
  const isHotelierRoute = pathname.startsWith('/hotel-dashboard');

  const targetLoginUrl = isAgencyRoute ? '/agency/login' : '/hotel/login';
  const loginUrl = new URL(targetLoginUrl, request.url);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  const decodedToken = await verifyToken(token);

  if (!decodedToken) {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('session');
    return response;
  }

  const { role, hotelId } = decodedToken;

  if (isAgencyRoute) {
    if (role !== 'agency') {
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('session');
      return response;
    }
  }
  else if (isHotelierRoute) {
    const requestedHotelId = pathname.split('/')[2];
    if (role !== 'hotelier' || hotelId !== requestedHotelId) {
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
