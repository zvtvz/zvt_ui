import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 根路径重定向到交易页，避免 404
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/trade', request.url));
  }
  return NextResponse.next();
}
