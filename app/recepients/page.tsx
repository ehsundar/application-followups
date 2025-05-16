'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '../components/FileUpload';
import { ApplicantTable } from '../components/ApplicantTable';
import { Applicant } from '../types';
import { parseCSV } from '../utils';

interface RecipientListMeta {
  id: string;
  name: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export default function Recepients() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [lists, setLists] = useState<RecipientListMeta[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/init').then((res) => {
      if (res.status !== 200) router.push('/login');
    }).catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    fetch('/api/recepients/list')
      .then(res => res.json())
      .then(data => setLists(data));
  }, []);

  useEffect(() => {
    if (selectedListId) {
      setLoading(true);
      fetch(`/api/recepients/${selectedListId}/recipients`)
        .then(res => res.json())
        .then(data => {
          setApplicants(data.map((r: any) => ({
            email: r.email,
            name: r.firstName + (r.lastName ? ' ' + r.lastName : ''),
            university: r.university,
            emailDate: '',
            subject: r.researchField,
            selected: true,
          })));
        })
        .finally(() => setLoading(false));
    } else {
      setApplicants([]);
    }
  }, [selectedListId]);

  const handleFileUpload = async (file: File, name: string) => {
    setLoading(true);
    try {
      const applicants = await parseCSV(file);
      const res = await fetch('/api/recepients/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, applicants }),
      });
      if (res.ok) {
        const newList = await res.json();
        setLists(lists => [newList, ...lists]);
        setSelectedListId(newList.id);
      } else {
        alert('Failed to insert list');
      }
    } catch (e) {
      alert('Failed to parse CSV');
    }
    setLoading(false);
  };

  const handleNext = () => {
    router.push('/templates');
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Application Follow-ups</h1>
        <button
          onClick={() => {
            setApplicants([]);
            setSelectedListId(null);
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Start Over
        </button>
      </div>

      <FileUpload onUpload={handleFileUpload} />

      <div className="mt-6">
        <label className="block mb-2 font-medium">Select a previously uploaded list:</label>
        <select
          className="border rounded px-3 py-2"
          value={selectedListId || ''}
          onChange={e => setSelectedListId(e.target.value || null)}
        >
          <option value="">-- Select a list --</option>
          {lists.map(list => (
            <option key={list.id} value={list.id}>
              {list.name} ({list.count} recipients)
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="mt-4 text-blue-600">Loading...</div>}

      {applicants.length > 0 && !loading && (
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
          </div>
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
