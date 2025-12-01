import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          res.cookies.set(cookiesToSet as any);
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

 
  const protectedPaths = ['/home', '/profile', '/notifications', '/admin'];
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));


  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.includes(path);


  if (!session && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};