import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromAuthCookie } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getUserFromAuthCookie();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const { name, applicants } = await request.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'List name is required' }, { status: 400 });
    }
    if (!Array.isArray(applicants) || applicants.length === 0) {
      return NextResponse.json({ error: 'No applicants provided' }, { status: 400 });
    }
    const createdList = await prisma.recipientList.create({
      data: {
        name: name.trim(),
        user: { connect: { id: user.id } },
        recipients: {
          create: applicants.map((a: any) => ({
            email: a.email,
            firstName: a.name?.split(' ')[0] || '',
            lastName: a.name?.split(' ')[1] || '',
            university: a.university || '',
            researchField: a.subject || '',
          })),
        },
      },
      include: { recipients: true },
    });
    return NextResponse.json({
      id: createdList.id,
      name: createdList.name,
      count: createdList.recipients.length,
      createdAt: createdList.createdAt,
      updatedAt: createdList.updatedAt,
    });
  } catch (error) {
    console.error('Error inserting recipient list:', error);
    return NextResponse.json({ error: 'Failed to insert recipient list' }, { status: 500 });
  }
}
