import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/firebase';

export async function POST(request: Request) {
  const { idToken } = await request.json();
  
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

  const response = new NextResponse(JSON.stringify({ status: 'success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });

  response.cookies.set('__session', sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax'
  });

  return response;
} 