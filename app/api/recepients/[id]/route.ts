import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromAuthCookie } from '@/app/lib/auth';

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const user = await getUserFromAuthCookie();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { params } = context;
    const listId = params.id;
    // First, delete all recipients in the list
    await prisma.recipient.deleteMany({
      where: { recipientListId: listId },
    });
    // Then, delete the list
    const deleted = await prisma.recipientList.deleteMany({
      where: { id: listId, userId: user.id },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const user = await getUserFromAuthCookie();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { params } = context;
    const listId = params.id;
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'List name is required' }, { status: 400 });
    }
    const updated = await prisma.recipientList.updateMany({
      where: { id: listId, userId: user.id },
      data: { name: name.trim() },
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to rename list' }, { status: 500 });
  }
}
