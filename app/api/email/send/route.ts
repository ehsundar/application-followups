import { NextResponse } from 'next/server';
import { sendEmail } from '@/app/services/email';

export async function POST(request: Request) {
  try {
    const { to, subject, body, sourceEmail, appKey, attachment } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or body' },
        { status: 400 }
      );
    }

    const result = await sendEmail(to, subject, body, sourceEmail, appKey, attachment);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in email send endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
