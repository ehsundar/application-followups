import Papa from 'papaparse';
import { Applicant, EmailTemplate } from './types';

export function parseCSV(file: File): Promise<Applicant[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      transformHeader: (header) => header.toLowerCase(),
      complete: (results) => {
        const applicants: Applicant[] = results.data
          .filter((row: any) => row.email && row.name && row.university) // Filter out empty rows
          .map((row: any) => ({
            email: row.email,
            name: row.name,
            university: row.university,
            emailDate: row.emaildate,
            subject: row.subject,
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

export function renderEmailTemplate(template: string, applicant: Applicant): string {
  return template
    .replace('{{name}}', applicant.name)
    .replace('{{email}}', applicant.email)
    .replace('{{university}}', applicant.university)
    .replace('{{emailDate}}', applicant.emailDate)
    .replace('{{subject}}', applicant.subject);
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
