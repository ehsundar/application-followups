import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromAuthCookie } from '@/app/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromAuthCookie();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { id: listId } = await params;
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromAuthCookie();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { id: listId } = await params;
    const { recipientId, data } = await request.json();
    if (!recipientId || !data) {
      return NextResponse.json({ error: 'Recipient id and data required' }, { status: 400 });
    }
    const updated = await prisma.recipient.updateMany({
      where: { id: recipientId, recipientListId: listId },
      data,
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update recipient' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromAuthCookie();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { id: listId } = await params;
    const { recipientId } = await request.json();
    if (!recipientId) {
      return NextResponse.json({ error: 'Recipient id required' }, { status: 400 });
    }
    const deleted = await prisma.recipient.deleteMany({
      where: { id: recipientId, recipientListId: listId },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete recipient' }, { status: 500 });
  }
}
