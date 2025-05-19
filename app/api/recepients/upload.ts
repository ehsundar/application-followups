import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getUserFromAuthCookie } from '@/app/lib/auth';
import { parse } from 'csv-parse/sync';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getUserFromAuthCookie();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const listName = formData.get('name') || 'Untitled List';
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    // Parse CSV
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: 'CSV is empty or invalid' }, { status: 400 });
    }

    // Create RecipientList and Recipients
    const createdList = await prisma.recipientList.create({
      data: {
        name: String(listName),
        user: { connect: { id: user.id } },
        recipients: {
          create: records.map((row: Record<string, string>) => ({
            email: row.Email || row.email,
            firstName: row.FirstName || row.firstName || row.Name?.split(' ')[0] || '',
            lastName: row.LastName || row.lastName || row.Name?.split(' ')[1] || '',
            university: row.University || row.university || '',
            researchField: row.ResearchField || row.researchField || row.Subject || '',
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
    console.error('Error uploading recipient list:', error);
    return NextResponse.json({ error: 'Failed to upload recipient list' }, { status: 500 });
  }
}
