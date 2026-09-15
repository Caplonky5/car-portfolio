import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get('password')?.toString();

  if (password === ADMIN_PASSWORD) {
    // Set a simple cookie-based session
    const cookieStore = await cookies();
    cookieStore.set('adminAuth', 'true', { maxAge: 60 * 60 * 24 }); // 1 day
    return NextResponse.redirect(new URL('/admin', request.url));
  } else {
    return NextResponse.json(
      { error: 'Incorrect password' },
      { status: 401 }
    );
  }
}