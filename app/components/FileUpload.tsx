import { useCallback } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
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
        email, name, field of work
      </p>
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
    </div>
  );
}
