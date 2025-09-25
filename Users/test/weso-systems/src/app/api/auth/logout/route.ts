import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Instruct the browser to delete the cookie
    response.cookies.set({
      name: 'firebaseIdToken',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Error in logout API route:', error);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
