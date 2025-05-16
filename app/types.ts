export interface Applicant {
  id?: string;
  email: string;
  name: string;
  university: string;
  emailDate: string;
  subject: string;
  selected?: boolean;
}

export interface EmailTemplate {
  label: string;
  subject: string;
  body: string;
}

export interface EmailPreview {
  applicant: Applicant;
  template: EmailTemplate;
  renderedBody: string;
}
