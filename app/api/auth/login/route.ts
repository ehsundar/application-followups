import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { sendVerificationCode } from '@/app/services/email';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

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

    // Send verification code via email
    // await sendVerificationCode(email, code);
    console.log('Verification code:', code);

    return NextResponse.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to process login request' },
      { status: 500 }
    );
  }
}
