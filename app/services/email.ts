import nodemailer from 'nodemailer';

const USE_DUMMY_EMAILS = process.env.USE_DUMMY_EMAILS === 'true';

// Function to create a transporter with given credentials or environment variables
function createTransporter(sourceEmail?: string, appKey?: string) {
  const useProvidedCredentials = sourceEmail && appKey;

  if (!USE_DUMMY_EMAILS && !useProvidedCredentials && (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD)) {
    throw new Error('Gmail credentials are not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables or provide credentials.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: useProvidedCredentials ? sourceEmail : process.env.GMAIL_USER,
      pass: useProvidedCredentials ? appKey : process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendEmail(to: string, subject: string, body: string, sourceEmail?: string, appKey?: string) {
  try {
    if (USE_DUMMY_EMAILS) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate success with 90% probability
      if (Math.random() > 0.5) {
        return {
          success: true,
          messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(7)}`
        };
      } else {
        // Simulate random errors
        const errors = [
          'Network timeout',
          'Server busy',
          'Invalid recipient',
          'Rate limit exceeded'
        ];
        throw new Error(errors[Math.floor(Math.random() * errors.length)]);
      }
    }

    const formattedBody = body.replace(/\n/g, '<br>');
    const transporter = createTransporter(sourceEmail, appKey);

    const info = await transporter.sendMail({
      from: sourceEmail || process.env.GMAIL_USER,
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
