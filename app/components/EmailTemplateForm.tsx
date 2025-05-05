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
  const validateTemplate = (field: keyof EmailTemplate, value: string): string | undefined => {
    if (field === 'subject' || field === 'body') {
      // Check for partial completion
      if ((field === 'subject' && value && !template.body) ||
          (field === 'body' && value && !template.subject)) {
        return 'Please complete both subject and body, or leave both empty.';
      }

      // Check for valid variables in body
      if (field === 'body') {
        const validVariables = ['{{name}}', '{{email}}', '{{university}}', '{{emailDate}}', '{{subject}}'];
        const matches = value.match(/{{[^}]+}}/g) || [];
        const invalidVariables = matches.filter(match => !validVariables.includes(match));

        if (invalidVariables.length > 0) {
          return `Invalid variables found: ${invalidVariables.join(', ')}. Only ${validVariables.join(', ')} are allowed.`;
        }
      }
    }
    return undefined;
  };

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
            <li><code>{'{{name}}'}</code> - Applicant's name</li>
            <li><code>{'{{email}}'}</code> - Applicant's email</li>
            <li><code>{'{{university}}'}</code> - Applicant's university</li>
            <li><code>{'{{emailDate}}'}</code> - Email date</li>
            <li><code>{'{{subject}}'}</code> - Email subject</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
