import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendVerificationCode } from '@/app/services/email';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email, recaptchaToken } = await request.json();
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
      if (!recaptchaToken) {
        return NextResponse.json(
          { error: 'reCAPTCHA token is required' },
          { status: 400 }
        );
      }

      // Verify reCAPTCHA token
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success || verifyData.score < 0.5) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!email.endsWith('@gmail.com')) {
      return NextResponse.json(
        { error: 'Only Gmail addresses are supported' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Default name from email
        },
      });
    }

    // Generate and save verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationCode.create({
      data: {
        code,
        userId: user.id,
        expiresAt,
      },
    });

    if (isDev) {
      console.log('Verification code:', code);
    } else {
      await sendVerificationCode(email, code);
    }

    return NextResponse.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to process login request' },
      { status: 500 }
    );
  }
}
