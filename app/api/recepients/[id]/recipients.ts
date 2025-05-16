import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromAuthCookie } from '@/app/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromAuthCookie();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const listId = params.id;
    const list = await prisma.recipientList.findUnique({
      where: { id: listId, userId: user.id },
      include: { recipients: true },
    });
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }
    return NextResponse.json(list.recipients);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
  }
}
