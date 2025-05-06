'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from './components/FileUpload';
import { ApplicantTable } from './components/ApplicantTable';
import { Applicant } from './types';
import { parseCSV } from './utils';

export default function Home() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [hasUploadedFile, setHasUploadedFile] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      const parsedApplicants = await parseCSV(file);
      setApplicants(parsedApplicants);
      setHasUploadedFile(true);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the format and try again.');
    }
  };

  const handleNext = () => {
    // Store selected applicants in localStorage for the next page
    localStorage.setItem('selectedApplicants', JSON.stringify(applicants));
    router.push('/templates');
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Application Follow-ups</h1>
        <button
          onClick={() => {
            localStorage.removeItem('selectedApplicants');
            setApplicants([]);
            setHasUploadedFile(false);
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Start Over
        </button>
      </div>

      <FileUpload onUpload={handleFileUpload} />

      {hasUploadedFile && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <ApplicantTable
            applicants={applicants}
            onApplicantsChange={setApplicants}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:cursor-pointer flex items-center gap-2"
              aria-label="Configure Templates"
            >
              <span>Configure Templates</span>
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
