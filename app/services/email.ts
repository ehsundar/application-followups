import nodemailer from 'nodemailer';

// Interface for resume attachment
interface ResumeAttachment {
  fileName: string;
  fileData: string; // base64 encoded file
  fileType: string;
}

// Define email options interface
interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string;
    encoding: string;
    contentType: string;
  }[];
}

const USE_DUMMY_EMAILS = process.env.USE_DUMMY_EMAILS === 'true';
const MAX_ATTACHMENT_SIZE_MB = 10; // 10 MB max attachment size

// Function to create a transporter with given credentials
function createTransporter(sourceEmail: string, appKey: string) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: sourceEmail,
      pass: appKey,
    },
  });
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  sourceEmail: string,
  appKey: string,
  attachment?: ResumeAttachment | null
) {
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

    // Create email options
    const mailOptions: MailOptions = {
      from: sourceEmail,
      to,
      subject,
      html: formattedBody,
    };

    // Add attachment if provided
    if (attachment) {
      // Validate attachment file type
      if (attachment.fileType !== 'application/pdf') {
        throw new Error('Invalid attachment: Only PDF files are allowed');
      }

      // Extract the base64 data (remove the data:application/pdf;base64, part)
      const base64Data = attachment.fileData.split(';base64,').pop();

      if (base64Data) {
        // Check attachment size (base64 encoded size is roughly 4/3 of the original)
        const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
        const sizeInMB = sizeInBytes / (1024 * 1024);

        if (sizeInMB > MAX_ATTACHMENT_SIZE_MB) {
          throw new Error(`Attachment size exceeds maximum allowed size of ${MAX_ATTACHMENT_SIZE_MB}MB`);
        }

        mailOptions.attachments = [
          {
            filename: attachment.fileName,
            content: base64Data,
            encoding: 'base64',
            contentType: attachment.fileType
          }
        ];
      }
    }

    const info = await transporter.sendMail(mailOptions);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
