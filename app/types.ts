export interface Applicant {
  email: string;
  name: string;
  fieldOfWork: string;
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
