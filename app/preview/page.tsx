'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmailPreview } from '../types';
import { renderEmailTemplate } from '../utils';

interface EmailStatus {
  loading: boolean;
  error: string;
  success: boolean;
}

export default function PreviewPage() {
  const router = useRouter();
  const [emailPreviews, setEmailPreviews] = useState<EmailPreview[]>([]);
  const [expandedEmails, setExpandedEmails] = useState<Set<number>>(new Set());
  const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const storedApplicants = localStorage.getItem('selectedApplicants');
    const storedTemplates = localStorage.getItem('emailTemplates');

    if (storedApplicants && storedTemplates) {
      const applicants = JSON.parse(storedApplicants);
      const templates = JSON.parse(storedTemplates);

      const previews: EmailPreview[] = [];
      applicants.forEach((applicant: any) => {
        if (applicant.selected) {
          const template = templates.find((t: any) => t.label === applicant.subject);
          if (template && template.subject && template.body) {
            previews.push({
              applicant,
              template,
              renderedBody: renderEmailTemplate(template.body, applicant)
            });
          }
        }
      });

      setEmailPreviews(previews);
      setEmailStatuses(previews.map(() => ({ loading: false, error: '', success: false })));
    }
  }, []);

  const toggleEmail = (index: number) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEmails(newExpanded);
  };

  const handleSend = async () => {
    setIsSending(true);
    const newStatuses = emailPreviews.map(() => ({ loading: true, error: '', success: false }));
    setEmailStatuses(newStatuses);

    let allSuccess = true;

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
            subject: preview.template.subject,
            body: preview.renderedBody,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to send email to ${preview.applicant.email}`);
        }

        newStatuses[i] = { loading: false, error: '', success: true };
      } catch (error) {
        allSuccess = false;
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

      <div className="space-y-4">
        {emailPreviews.map((preview, index) => (
          <div key={index} className="border rounded-lg">
            <button
              onClick={() => toggleEmail(index)}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
            >
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
              <div className="text-gray-500">
                {expandedEmails.has(index) ? '▼' : '▶'}
              </div>
            </button>

            {expandedEmails.has(index) && (
              <div className="p-4 border-t">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Subject</h2>
                  <p>{preview.template.subject}</p>
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
            )}
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
