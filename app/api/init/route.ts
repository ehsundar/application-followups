import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;
    if (!token) return NextResponse.json({}, { status: 200 });
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    if (!payload || typeof payload.email !== 'string') return NextResponse.json({}, { status: 200 });
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) return NextResponse.json({}, { status: 200 });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
