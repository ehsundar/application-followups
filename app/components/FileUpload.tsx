import { useCallback, useEffect, useState } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [hasExistingData, setHasExistingData] = useState(false);

  useEffect(() => {
    const storedApplicants = localStorage.getItem('selectedApplicants');
    setHasExistingData(!!storedApplicants);
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  }, [onUpload]);

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>
      <p className="text-gray-600 mb-4">
        Please upload a CSV file with the following columns:
        <br />
        University, Name, Email, EmailDate, Subject
      </p>
      {hasExistingData && (
        <p className="text-amber-600 mb-4 font-medium">
          Note: Uploading a new file will replace your existing data
        </p>
      )}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />

      <div className="mt-8 text-left">
        <h3 className="text-lg font-medium mb-2">Sample CSV Format:</h3>
        <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-100 font-mono">
          University,Name,Email,EmailDate,Subject{'\n'}
          Harvard,Filipe De Carvalho,fcarvalho@bwh.harvard.edu,1404-1-17,urologic oncology{'\n'}
          Stanford,John Smith,john.smith@stanford.edu,1404-1-18,cardiac surgery{'\n'}
          MIT,Jane Doe,jane.doe@mit.edu,1404-1-19,neuroscience{'\n'}
          Yale,Robert Johnson,robert.j@yale.edu,1404-1-20,immunology{'\n'}
          Columbia,Sarah Williams,sarah.w@columbia.edu,1404-1-21,pediatric medicine
        </pre>
      </div>
    </div>
  );
}
