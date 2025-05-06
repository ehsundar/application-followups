import Papa from 'papaparse';
import { Applicant, EmailTemplate } from './types';

export function parseCSV(file: File): Promise<Applicant[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      transformHeader: (header) => header.toLowerCase(),
      complete: (results: { data: Array<Record<string, string>> }) => {
        const applicants: Applicant[] = results.data
          .filter((row) => row.email && row.name && row.university)
          .map((row) => ({
            email: row.email,
            name: row.name,
            university: row.university,
            emailDate: row.emaildate || '',
            subject: row.subject || '',
            selected: true
          }));
        resolve(applicants);
      },
      error: (error) => reject(error)
    });
  });
}

export function getUniqueLabels(applicants: Applicant[]): string[] {
  const labels = new Set<string>();
  applicants.forEach(applicant => {
    labels.add(applicant.subject);
  });
  return Array.from(labels).sort();
}

export interface TemplateVariable {
  description: string;
  getValue: (applicant: Applicant) => string;
}

export interface TemplateVariables {
  [key: string]: TemplateVariable;
}

export const defaultTemplateVariables: TemplateVariables = {
  name: {
    description: "Applicant's full name",
    getValue: (applicant: Applicant) => applicant.name
  },
  email: {
    description: "Applicant's email",
    getValue: (applicant: Applicant) => applicant.email
  },
  university: {
    description: "Applicant's university",
    getValue: (applicant: Applicant) => applicant.university
  },
  emailDate: {
    description: "Email date",
    getValue: (applicant: Applicant) => applicant.emailDate
  },
  subject: {
    description: "Email subject",
    getValue: (applicant: Applicant) => applicant.subject
  },
  firstName: {
    description: "Applicant's first name",
    getValue: (applicant: Applicant) => {
      const nameParts = applicant.name.split(' ');
      return nameParts[0] || '';
    }
  },
  lastName: {
    description: "Applicant's last name",
    getValue: (applicant: Applicant) => {
      const nameParts = applicant.name.split(' ');
      return nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    }
  }
};

export function getTemplateVariablePlaceholder(variables: TemplateVariables = defaultTemplateVariables): string {
  return `Email body (use ${Object.keys(variables).map(key => `{{${key}}}`).join(', ')} for variables)`;
}

export function renderEmailTemplate(template: string, applicant: Applicant, variables: TemplateVariables = defaultTemplateVariables): string {
  let result = template;

  // Process all variables
  Object.entries(variables).forEach(([key, variable]) => {
    const value = variable.getValue(applicant);
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return result;
}

export function saveEmailTemplates(templates: EmailTemplate[]) {
  localStorage.setItem('emailTemplates', JSON.stringify(templates));
}

export function loadEmailTemplates(): EmailTemplate[] {
  const storedTemplates = localStorage.getItem('emailTemplates');
  return storedTemplates ? JSON.parse(storedTemplates) : [];
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().trim();
}

export function mapTemplatesToLabels(savedTemplates: EmailTemplate[], currentLabels: string[]): EmailTemplate[] {
  // Create a map of normalized labels to templates
  const templateMap = new Map(
    savedTemplates.map(template => [normalizeLabel(template.label), template])
  );

  // For each current label, try to find a matching template
  return currentLabels.map(label => {
    const normalizedLabel = normalizeLabel(label);
    const savedTemplate = templateMap.get(normalizedLabel);

    if (savedTemplate) {
      return {
        ...savedTemplate,
        label // Keep the original label case
      };
    }

    return {
      label,
      subject: '',
      body: ''
    };
  });
}
