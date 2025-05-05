import Papa from 'papaparse';
import { Applicant, EmailTemplate } from './types';

export function parseCSV(file: File): Promise<Applicant[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const applicants: Applicant[] = results.data
          .filter((row: any) => row.email && row.name && row['field of work']) // Filter out empty rows
          .map((row: any) => ({
            email: row.email,
            name: row.name,
            fieldOfWork: row['field of work'],
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
    labels.add(applicant.fieldOfWork);
  });
  return Array.from(labels).sort();
}

export function renderEmailTemplate(template: string, applicant: Applicant): string {
  return template
    .replace('{{name}}', applicant.name)
    .replace('{{email}}', applicant.email)
    .replace('{{field}}', applicant.fieldOfWork);
}

export function saveEmailTemplates(templates: EmailTemplate[]) {
  localStorage.setItem('emailTemplates', JSON.stringify(templates));
}

export function loadEmailTemplates(): EmailTemplate[] {
  const storedTemplates = localStorage.getItem('emailTemplates');
  return storedTemplates ? JSON.parse(storedTemplates) : [];
}
