import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // Compara con las variables de entorno
    if (user === process.env.ADMIN_USER && pwd === process.env.ADMIN_PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Autenticación requerida', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="ZYRVAE Scout Secure"',
    },
  });
}

export const config = {
  matcher: '/:path*',
};
