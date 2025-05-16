import { useCallback, useEffect, useState } from 'react';

interface FileUploadProps {
  onUpload: (file: File, name: string) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [hasExistingData, setHasExistingData] = useState(false);
  const [listName, setListName] = useState('');

  useEffect(() => {
    const storedApplicants = localStorage.getItem('selectedApplicants');
    setHasExistingData(!!storedApplicants);
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file, listName || 'Untitled List');
    }
  }, [onUpload, listName]);

  return (
    <div className="border-2 border-dashed border-gray-600 dark:border-gray-700 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Upload CSV File</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Please upload a CSV file with the following columns:
        <br />
        University, Name, Email, EmailDate, Subject
      </p>
      <input
        type="text"
        placeholder="List name"
        value={listName}
        onChange={e => setListName(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full"
      />
      {listName === '' && (
        <p className="text-red-600 dark:text-red-400 mb-4 font-medium">List name is required</p>
      )}
      {hasExistingData && (
        <p className="text-amber-600 dark:text-amber-400 mb-4 font-medium">
          Note: Uploading a new file will replace your existing data
        </p>
      )}
      <input
        type="file"
        accept=".csv"
        onChange={e => {
          if (!listName) return;
          handleFileChange(e);
        }}
        className="block w-full text-sm text-gray-500 dark:text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          dark:file:bg-blue-900 dark:file:text-blue-300
          hover:file:bg-blue-100 dark:hover/file:bg-blue-800"
        disabled={!listName}
      />

      <div className="mt-8 text-left">
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Sample CSV Format:</h3>
        <pre className="bg-gray-800 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-100 font-mono">
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
