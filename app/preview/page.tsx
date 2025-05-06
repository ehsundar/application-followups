'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { renderEmailTemplate } from '../utils';

interface EmailStatus {
  loading: boolean;
  error: string;
  success: boolean;
}

interface Applicant {
  selected: boolean;
  subject: string;
  email: string;
  name: string;
  university: string;
  emailDate: string;
}

interface Template {
  label: string;
  subject: string;
  body: string;
}

interface EmailCredentials {
  sourceEmail: string;
  appKey: string;
}

interface ValidationErrors {
  sourceEmail?: string;
  appKey?: string;
}

interface ResumeAttachment {
  fileName: string;
  fileData: string; // base64 encoded file
  fileType: string;
}

interface EmailPreview {
  applicant: Applicant;
  template: Template;
  renderedBody: string;
  renderedSubject: string;
}

export default function PreviewPage() {
  const router = useRouter();
  const [emailPreviews, setEmailPreviews] = useState<EmailPreview[]>([]);
  const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [credentials, setCredentials] = useState<EmailCredentials>({
    sourceEmail: '',
    appKey: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showAppKey, setShowAppKey] = useState(false);
  const [resumeAttachment, setResumeAttachment] = useState<ResumeAttachment | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    // Gmail regex pattern - requires @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!email) return "Gmail address is required";
    if (!gmailRegex.test(email)) return "Please enter a valid Gmail address";
    return undefined;
  };

  const validateAppKey = (key: string): string | undefined => {
    // Google app passwords are 16 characters, often displayed as 4 groups of 4 with spaces
    // We'll allow both formats: with spaces "xxxx xxxx xxxx xxxx" or without "xxxxxxxxxxxxxxxx"
    const appKeyWithSpacesRegex = /^([a-zA-Z0-9]{4}\s){3}[a-zA-Z0-9]{4}$/;
    const appKeyNoSpacesRegex = /^[a-zA-Z0-9]{16}$/;

    if (!key) return "App key is required";
    if (!appKeyWithSpacesRegex.test(key) && !appKeyNoSpacesRegex.test(key)) {
      return "App key must be 16 characters in format 'xxxx xxxx xxxx xxxx'";
    }
    return undefined;
  };

  useEffect(() => {
    const storedApplicants = localStorage.getItem('selectedApplicants');
    const storedTemplates = localStorage.getItem('emailTemplates');
    const storedCredentials = localStorage.getItem('emailCredentials');
    const storedResume = localStorage.getItem('resumeAttachment');

    if (storedCredentials) {
      const parsedCredentials = JSON.parse(storedCredentials) as EmailCredentials;
      setCredentials(parsedCredentials);

      // Validate stored credentials
      const emailError = validateEmail(parsedCredentials.sourceEmail);
      const keyError = validateAppKey(parsedCredentials.appKey);

      // Update validation errors if any
      if (emailError || keyError) {
        setValidationErrors({
          sourceEmail: emailError,
          appKey: keyError
        });
      }
    }

    if (storedResume) {
      try {
        const parsedResume = JSON.parse(storedResume) as ResumeAttachment;
        setResumeAttachment(parsedResume);
      } catch (error) {
        console.error('Failed to parse stored resume', error);
      }
    }

    if (storedApplicants && storedTemplates) {
      const applicants = JSON.parse(storedApplicants) as Applicant[];
      const templates = JSON.parse(storedTemplates) as Template[];

      const previews: EmailPreview[] = [];
      applicants.forEach((applicant) => {
        if (applicant.selected) {
          const template = templates.find((t) => t.label === applicant.subject);
          if (template && template.subject && template.body) {
            previews.push({
              applicant,
              template,
              renderedBody: renderEmailTemplate(template.body, applicant),
              renderedSubject: renderEmailTemplate(template.subject, applicant)
            });
          }
        }
      });

      setEmailPreviews(previews);
      setEmailStatuses(previews.map(() => ({ loading: false, error: '', success: false })));
    }
  }, []);

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedCredentials = {
      ...credentials,
      [name]: value
    };
    setCredentials(updatedCredentials);

    // Validate on change
    let newErrors = { ...validationErrors };

    if (name === 'sourceEmail') {
      const error = validateEmail(value);
      if (error) {
        newErrors.sourceEmail = error;
      } else {
        delete newErrors.sourceEmail;
      }
    }

    if (name === 'appKey') {
      const error = validateAppKey(value);
      if (error) {
        newErrors.appKey = error;
      } else {
        delete newErrors.appKey;
      }
    }

    setValidationErrors(newErrors);
    localStorage.setItem('emailCredentials', JSON.stringify(updatedCredentials));
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is a PDF
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const fileData = event.target.result as string;
        const newResume: ResumeAttachment = {
          fileName: file.name,
          fileData: fileData,
          fileType: file.type
        };

        setResumeAttachment(newResume);
        localStorage.setItem('resumeAttachment', JSON.stringify(newResume));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    setResumeAttachment(null);
    localStorage.removeItem('resumeAttachment');
  };

  const handleSend = async () => {
    // Validate before sending
    const emailError = validateEmail(credentials.sourceEmail);
    const keyError = validateAppKey(credentials.appKey);

    if (emailError || keyError) {
      setValidationErrors({
        sourceEmail: emailError,
        appKey: keyError
      });
      return;
    }

    setIsSending(true);
    const newStatuses = emailPreviews.map(() => ({ loading: true, error: '', success: false }));
    setEmailStatuses(newStatuses);

    for (let i = 0; i < emailPreviews.length; i++) {
      const preview = emailPreviews[i];
      try {
        const response = await fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: preview.applicant.email,
            subject: preview.renderedSubject,
            body: preview.renderedBody,
            sourceEmail: credentials.sourceEmail,
            appKey: credentials.appKey,
            attachment: resumeAttachment
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          // Extract detailed error message from the API response
          const errorMessage = responseData.error || `Failed to send email to ${preview.applicant.email}`;
          throw new Error(errorMessage);
        }

        newStatuses[i] = { loading: false, error: '', success: true };
      } catch (error) {
        newStatuses[i] = {
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to send email',
          success: false
        };
      }
      setEmailStatuses([...newStatuses]);
    }

    setIsSending(false);
  };

  if (emailPreviews.length === 0) {
    return (
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">No Emails to Send</h1>
        <p>No emails were configured for sending. Please go back and configure email templates.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Preview and Send Emails</h1>
        <button
          onClick={() => {
            localStorage.removeItem('selectedApplicants');
            router.push('/');
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Start Over
        </button>
      </div>

      <div className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Email Credentials</h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label htmlFor="sourceEmail" className="block text-sm font-medium text-gray-700">
              Gmail Address
            </label>
            <input
              type="email"
              id="sourceEmail"
              name="sourceEmail"
              value={credentials.sourceEmail}
              onChange={handleCredentialsChange}
              className={`mt-1 block w-full border ${validationErrors.sourceEmail ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white text-gray-900`}
              placeholder="your.email@gmail.com"
              autoComplete="username email"
            />
            {validationErrors.sourceEmail && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.sourceEmail}</p>
            )}
          </div>
          <div>
            <label htmlFor="appKey" className="block text-sm font-medium text-gray-700">
              Gmail App Key
            </label>
            <div className="relative">
              <input
                type={showAppKey ? "text" : "password"}
                id="appKey"
                name="appKey"
                value={credentials.appKey}
                onChange={handleCredentialsChange}
                className={`mt-1 block w-full border ${validationErrors.appKey ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2 bg-white text-gray-900`}
                placeholder="Your app password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowAppKey(!showAppKey)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-gray-900"
                aria-label={showAppKey ? "Hide app key" : "Show app key"}
              >
                {showAppKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.appKey && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.appKey}</p>
            )}
            <div className="mt-1 flex items-start">
              <div className="group relative inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 w-64 z-10">
                  App passwords are 16-character codes that give apps or devices permission to access your Google Account. You need to have 2-Step Verification enabled first.
                </div>
              </div>
              <p className="text-sm text-gray-600">
                You need to create an app password in your Google account settings.
                <a
                  href="https://www.geeksforgeeks.org/setup-sending-email-in-django-project/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-500 hover:text-blue-700 underline"
                >
                  How to create an app password?
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>

      <div className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Resume Attachment (PDF only)</h2>
        <div className="space-y-4">
          {resumeAttachment ? (
            <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-300">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-900">{resumeAttachment.fileName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPdfPreview(true)}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Preview PDF"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={handleRemoveResume}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove resume"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <label
                htmlFor="resumeUpload"
                className="flex justify-center items-center p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
              >
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="mt-2 block text-sm font-medium text-gray-700">
                    Click to upload or drag and drop
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    PDF files only, up to 10MB
                  </span>
                </div>
              </label>
              <input
                id="resumeUpload"
                name="resumeUpload"
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={handleResumeUpload}
              />
            </div>
          )}
          <p className="text-sm text-gray-600">
            This PDF resume will be attached to all emails.
          </p>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPdfPreview && resumeAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-3 border-b">
              <h3 className="text-lg font-semibold">{resumeAttachment.fileName}</h3>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-1 h-full">
              <iframe
                src={resumeAttachment.fileData}
                className="w-full h-full border-0"
                title="Resume PDF Preview"
                style={{ minHeight: "calc(95vh - 6rem)" }}
              />
            </div>
            <div className="p-3 border-t flex justify-end">
              <button
                onClick={() => setShowPdfPreview(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {emailPreviews.map((preview, index) => (
          <div key={index} className="border rounded-lg">
            <div className="w-full p-4 text-left flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="font-medium">{preview.applicant.name}</span>
                <span className="text-gray-500">({preview.applicant.email})</span>
                <span className="text-gray-500">- {preview.applicant.subject}</span>
                {emailStatuses[index]?.loading && (
                  <span className="text-blue-500">Sending...</span>
                )}
                {emailStatuses[index]?.success && (
                  <span className="text-green-500">✓ Sent</span>
                )}
                {emailStatuses[index]?.error && (
                  <span className="text-red-500">✗ Failed</span>
                )}
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Subject</h2>
                <p>{preview.renderedSubject}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Body</h2>
                <div className="border rounded p-4 bg-white">
                  <pre className="whitespace-pre-wrap text-gray-900">{preview.renderedBody}</pre>
                </div>
              </div>

              {emailStatuses[index]?.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-600">{emailStatuses[index].error}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSend}
        disabled={isSending}
        className={`mt-8 px-4 py-2 text-white rounded ${
          isSending
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isSending ? 'Sending Emails...' : 'Send All Emails'}
      </button>
    </main>
  );
}
