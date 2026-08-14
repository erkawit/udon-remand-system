import { NextResponse } from 'next/server';

export function middleware(request) {
  const host = request.headers.get('host') || '';
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Static files and internal Next.js/API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  // Prevent domain crossover security breach
  if (host.includes('police') && pathname.startsWith('/court')) {
    return NextResponse.redirect(new URL('/police', request.url));
  }

  if (host.includes('court') && pathname.startsWith('/police')) {
    return NextResponse.redirect(new URL('/court', request.url));
  }

  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
