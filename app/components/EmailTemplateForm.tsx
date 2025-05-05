import { EmailTemplate } from '../types';

interface EmailTemplateFormProps {
  label: string;
  template: EmailTemplate;
  onChange: (template: EmailTemplate) => void;
  errors?: {
    subject?: string;
    body?: string;
  };
}

export function EmailTemplateForm({ label, template, onChange, errors }: EmailTemplateFormProps) {
  const handleChange = (field: keyof EmailTemplate, value: string) => {
    const newTemplate = {
      ...template,
      [field]: value
    };
    onChange(newTemplate);
  };

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Template for {label}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={template?.subject || ''}
            onChange={(e) => handleChange('subject', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.subject ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Email subject"
          />
          {errors?.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Body
          </label>
          <textarea
            value={template?.body || ''}
            onChange={(e) => handleChange('body', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors?.body ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={6}
            placeholder="Email body (use {{name}}, {{email}}, {{university}}, {{emailDate}}, {{subject}} for variables)"
          />
          {errors?.body && (
            <p className="mt-1 text-sm text-red-600">{errors.body}</p>
          )}
        </div>

        <div className="text-sm text-gray-500">
          <p>Available variables:</p>
          <ul className="list-disc list-inside">
            <li><code>{'{{name}}'}</code> - Applicant&apos;s name</li>
            <li><code>{'{{email}}'}</code> - Applicant&apos;s email</li>
            <li><code>{'{{university}}'}</code> - Applicant&apos;s university</li>
            <li><code>{'{{emailDate}}'}</code> - Email date</li>
            <li><code>{'{{subject}}'}</code> - Email subject</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
