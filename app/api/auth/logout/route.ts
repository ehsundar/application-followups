import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('auth');
  cookieStore.delete('user');
  return NextResponse.json({ success: true });
}
