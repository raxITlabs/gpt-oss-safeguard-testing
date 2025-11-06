import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - always allow access without consent
  const publicRoutes = [
    '/consent',
    '/privacy',
    '/terms',
    '/api/consent',
  ];

  // Static assets and Next.js internals - always allow
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/logos') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check session
  try {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    // Check if user has accepted consent
    if (!session.isAccepted) {
      // User hasn't consented - redirect to consent page
      const url = request.nextUrl.clone();
      url.pathname = '/consent';

      // Preserve the original URL to redirect back after consent
      if (pathname !== '/') {
        url.searchParams.set('returnTo', pathname);
      }

      console.log(`🔒 Redirecting to consent: ${pathname} -> /consent`);
      return NextResponse.redirect(url);
    }

    // User has accepted consent - allow access
    console.log(`✅ Access granted to: ${pathname}`);
    return response;
  } catch (error) {
    console.error('❌ Middleware error:', error);

    // On error, redirect to consent page to be safe
    const url = request.nextUrl.clone();
    url.pathname = '/consent';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
