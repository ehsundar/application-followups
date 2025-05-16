'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { EmailTemplateForm } from '../components/EmailTemplateForm';
import { EmailTemplate } from '../types';
import { getUniqueLabels, loadEmailTemplates, saveEmailTemplates, mapTemplatesToLabels, defaultTemplateVariables } from '../utils';

interface TemplateErrors {
  [key: number]: {
    subject?: string;
    body?: string;
  };
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [errors, setErrors] = useState<TemplateErrors>({});

  useEffect(() => {
    const storedApplicants = localStorage.getItem('selectedApplicants');
    if (storedApplicants) {
      const parsedApplicants = JSON.parse(storedApplicants);
      const uniqueLabels = getUniqueLabels(parsedApplicants);
      setLabels(uniqueLabels);

      // Load saved templates and map them to current labels
      const savedTemplates = loadEmailTemplates();
      const mappedTemplates = mapTemplatesToLabels(savedTemplates, uniqueLabels);
      setTemplates(mappedTemplates);
      saveEmailTemplates(mappedTemplates);
    } else {
      router.push('/');
    }
  }, [router]);

  const validateTemplate = (template: EmailTemplate, index: number): TemplateErrors => {
    const templateErrors: { subject?: string; body?: string } = {};

    // Check for partial completion
    if ((template.subject && !template.body) || (!template.subject && template.body)) {
      templateErrors.subject = 'Please complete both subject and body, or leave both empty.';
      templateErrors.body = 'Please complete both subject and body, or leave both empty.';
    }

    // Check for required fields if either is filled
    if (template.subject || template.body) {
      if (!template.subject) {
        templateErrors.subject = 'Subject is required when body is filled.';
      }
      if (!template.body) {
        templateErrors.body = 'Body is required when subject is filled.';
      }
    }

    // Check for valid variables in body
    if (template.body) {
      const validVariables = Object.keys(defaultTemplateVariables).map(key => `{{${key}}}`);
      const matches = template.body.match(/{{[^}]+}}/g) || [];
      const invalidVariables = matches.filter(match => !validVariables.includes(match));

      if (invalidVariables.length > 0) {
        templateErrors.body = `Invalid variables found: ${invalidVariables.join(', ')}. Only ${validVariables.join(', ')} are allowed.`;
      }
    }

    return { [index]: templateErrors };
  };

  const handleTemplateChange = (index: number, template: EmailTemplate) => {
    const newTemplates = [...templates];
    newTemplates[index] = template;
    setTemplates(newTemplates);

    // Validate the changed template
    const newErrors = validateTemplate(template, index);
    setErrors(prevErrors => ({
      ...prevErrors,
      ...newErrors
    }));

    // Save templates whenever they change
    saveEmailTemplates(newTemplates);
  };

  const handleNext = () => {
    // Validate all templates before proceeding
    const allErrors: TemplateErrors = {};
    let hasErrors = false;

    templates.forEach((template, index) => {
      const templateErrors = validateTemplate(template, index);
      if (Object.keys(templateErrors[index] || {}).length > 0) {
        hasErrors = true;
        Object.assign(allErrors, templateErrors);
      }
    });

    setErrors(allErrors);

    if (!hasErrors) {
      // Check if at least one template is configured
      const hasConfiguredTemplate = templates.some(template => template.subject && template.body);
      if (!hasConfiguredTemplate) {
        alert('Please configure at least one email template before proceeding.');
        return;
      }

      // Save templates one last time before proceeding
      saveEmailTemplates(templates);
      router.push('/preview');
    }
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configure Email Templates</h1>
        <button
          onClick={() => {
            localStorage.removeItem('selectedApplicants');
            router.push('/recepients');
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Start Over
        </button>
      </div>

      <div className="space-y-8">
        {labels.map((label, index) => (
          <EmailTemplateForm
            key={label}
            label={label}
            template={templates[index]}
            onChange={(template) => handleTemplateChange(index, template)}
            errors={errors[index]}
          />
        ))}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer flex items-center gap-2"
        >
          Preview Emails <ArrowRight size={16} />
        </button>
      </div>
    </main>
  );
}
