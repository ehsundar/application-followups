import { NextResponse } from 'next/server';
import { users } from '@/app/config/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      // Set cookies to store authentication and user info
      const cookieStore = await cookies();
      cookieStore.set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
      });

      cookieStore.set('user', JSON.stringify({
        username: user.username,
        name: user.name
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return NextResponse.json({
        success: true,
        user: {
          username: user.username,
          name: user.name
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
