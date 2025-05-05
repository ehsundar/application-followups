'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmailPreview } from '../types';
import { renderEmailTemplate } from '../utils';

export default function PreviewPage() {
  const router = useRouter();
  const [emailPreviews, setEmailPreviews] = useState<EmailPreview[]>([]);
  const [expandedEmails, setExpandedEmails] = useState<Set<number>>(new Set());

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
    try {
      // Send all emails
      for (const preview of emailPreviews) {
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
      }

      alert('All emails sent successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send some emails. Please check the console for details.');
    }
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
              <div>
                <span className="font-medium">{preview.applicant.name}</span>
                <span className="text-gray-500 ml-2">({preview.applicant.email})</span>
                <span className="text-gray-500 ml-2">- {preview.applicant.subject}</span>
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
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSend}
        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Send All Emails
      </button>
    </main>
  );
}
