import { NextResponse } from 'next/server';
import { sendEmail } from '@/app/services/email';
import { getUserFromAuthCookie } from '@/app/lib/auth';

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

    // Use helper to get logged-in user's email
    let userPayload;
    try {
      userPayload = await getUserFromAuthCookie();
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Not authenticated' },
        { status: 401 }
      );
    }
    if (userPayload.email !== sourceEmail) {
      return NextResponse.json(
        { error: 'Provided email does not match the logged-in user' },
        { status: 403 }
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
