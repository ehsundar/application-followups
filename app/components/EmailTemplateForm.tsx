import { EmailTemplate } from '../types';
import { defaultTemplateVariables, getTemplateVariablePlaceholder } from '../utils';

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

  // Generate variable list from defaultTemplateVariables
  const renderVariableList = () => {
    return Object.entries(defaultTemplateVariables).map(([key, variable]) => (
      <li key={key}>
        <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{`{{${key}}}`}</code>
        {' - '}{variable.description}
      </li>
    ));
  };

  return (
    <div className="border rounded-lg p-6 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Template for {label}</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={template?.subject || ''}
            onChange={(e) => handleChange('subject', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
              errors?.subject ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Email subject"
          />
          {errors?.subject && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Body
          </label>
          <textarea
            value={template?.body || ''}
            onChange={(e) => handleChange('body', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
              errors?.body ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            rows={6}
            placeholder={getTemplateVariablePlaceholder()}
          />
          {errors?.body && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.body}</p>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Available variables:</p>
          <ul className="list-disc list-inside">
            {renderVariableList()}
          </ul>
        </div>
      </div>
    </div>
  );
}
