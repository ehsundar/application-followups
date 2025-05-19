import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromAuthCookie } from '@/app/lib/auth';

export async function GET() {
  try {
    const user = await getUserFromAuthCookie();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const lists = await prisma.recipientList.findMany({
      where: { userId: user.id },
      include: { _count: { select: { recipients: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(lists.map((list) => ({
      id: list.id,
      name: list.name && list.name.trim() ? list.name : 'Untitled List',
      count: list._count.recipients,
      createdAt: list.createdAt?.toString(),
      updatedAt: list.updatedAt?.toString(),
    })));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
  }
}
