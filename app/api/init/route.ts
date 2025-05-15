import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromAuthCookie } from '@/app/lib/auth';

export async function GET() {
  try {
    let payload;
    try {
      payload = await getUserFromAuthCookie();
    } catch {
      return NextResponse.json({}, { status: 200 });
    }
    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) return NextResponse.json({}, { status: 200 });
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } }, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
