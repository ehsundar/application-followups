import nodemailer from 'nodemailer';

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  throw new Error('Gmail credentials are not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, body: string) {
  try {
    // Convert newlines to HTML line breaks
    const formattedBody = body.replace(/\n/g, '<br>');

    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: formattedBody,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
