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

    if (!sourceEmail || !appKey) {
      return NextResponse.json(
        { error: 'Missing credentials: sourceEmail and appKey are required' },
        { status: 400 }
      );
    }

    const result = await sendEmail(to, subject, body, sourceEmail, appKey, attachment);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in email send endpoint:', error);

    // Return the specific error message to the client
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
