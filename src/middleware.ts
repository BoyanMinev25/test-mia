import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add the paths that don't require authentication
const publicPaths = ['/login', '/signup', '/forgot-password', '/auth/action']

export function middleware(request: NextRequest) {
  const session = request.cookies.get('__session')?.value
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.includes('._next') || 
    pathname.includes('_next') ||
    pathname.includes('favicon.ico') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // Allow auth-related paths without session
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Create URLs for redirects
  const loginUrl = new URL('/login', request.url)
  const dashboardUrl = new URL('/dashboard', request.url)

  // Redirect rules
  if (session) {
    // User is logged in
    if (pathname === '/login' || pathname === '/') {
      console.log('Middleware: Redirecting authenticated user to dashboard')
      return NextResponse.redirect(dashboardUrl)
    }
  } else {
    // User is not logged in
    if (pathname !== '/login') {
      console.log('Middleware: Redirecting unauthenticated user to login')
      return NextResponse.redirect(loginUrl)
    }
  }

  const response = NextResponse.next()
  
  // Updated CSP to properly allow Firebase connections
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com;
      connect-src 'self' 
        https://*.firebaseapp.com 
        https://*.googleapis.com 
        https://*.cloudfunctions.net 
        https://*.firebaseio.com 
        wss://*.firebaseio.com 
        https://*.firebaseauth.com 
        https://firestore.googleapis.com 
        https://*.firestore.googleapis.com;
      frame-src 'self' https://*.firebaseapp.com https://*.google.com https://accounts.google.com https://apis.google.com;
      img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://*.google.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com;
    `.replace(/\s{2,}/g, ' ').trim()
  )

  return response
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/']
} 