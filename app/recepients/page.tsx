'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '../components/FileUpload';
import { ApplicantTable } from '../components/ApplicantTable';
import { Applicant } from '../types';
import { parseCSV } from '../utils';
import { Pencil, Trash2 } from 'lucide-react';

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
  const [fileUploadKey, setFileUploadKey] = useState(0);
  const [renamingListId, setRenamingListId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

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
    if (selectedListId && selectedListId !== 'new') {
      setLoading(true);
      fetch(`/api/recepients/${selectedListId}/recipients`)
        .then(res => res.json())
        .then(data => {
          setApplicants(data.map((r: any) => ({
            id: r.id,
            email: r.email,
            name: (r.firstName || '') + (r.lastName ? ' ' + r.lastName : ''),
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
        setFileUploadKey(k => k + 1);
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

  // Delete list handler
  const handleDeleteList = async (id: string) => {
    if (!window.confirm('Delete this list?')) return;
    setLoading(true);
    const res = await fetch(`/api/recepients/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setLists(lists => lists.filter(l => l.id !== id));
      if (selectedListId === id) {
        setSelectedListId(null);
        setApplicants([]);
      }
    } else {
      alert('Failed to delete list');
    }
    setLoading(false);
  };

  // Rename list handler
  const handleRenameList = async (id: string, name: string) => {
    setLoading(true);
    const res = await fetch(`/api/recepients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setLists(lists => lists.map(l => l.id === id ? { ...l, name } : l));
      setRenamingListId(null);
    } else {
      alert('Failed to rename list');
    }
    setLoading(false);
  };

  // Delete recipient handler
  const handleDeleteRecipient = async (recipientId: string) => {
    if (!selectedListId) return;
    await fetch(`/api/recepients/${selectedListId}/recipients`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId }),
    });
  };

  // Edit recipient handler
  const handleEditRecipient = async (recipientId: string, data: Partial<Applicant>) => {
    if (!selectedListId) return;
    await fetch(`/api/recepients/${selectedListId}/recipients`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId, data }),
    });
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
      <div className="flex flex-col md:flex-row">
        {/* Left Pane: Lists and New List Button */}
        <div className="w-full md:w-1/3 md:min-w-[220px] md:max-w-xs md:border-r px-0 md:px-4 mb-6 md:mb-0">
          <div className="mb-6">
            <div className="font-semibold mb-2">Your Lists</div>
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full text-left px-3 py-2 rounded hover:bg-green-100 dark:hover:bg-green-900 ${selectedListId === 'new' ? 'bg-green-200 dark:bg-green-800 font-bold' : ''} cursor-pointer`}
                  onClick={() => {
                    setSelectedListId('new');
                    setFileUploadKey(k => k + 1);
                  }}
                >
                  + New List
                </button>
              </li>
              {lists.map(list => (
                <li key={list.id} className="flex items-center gap-2 group">
                  <button
                    className={`flex-1 text-left px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 ${selectedListId === list.id ? 'bg-blue-200 dark:bg-blue-800 font-bold' : ''} cursor-pointer`}
                    onClick={() => setSelectedListId(list.id)}
                  >
                    {renamingListId === list.id ? (
                      <input
                        className="border rounded px-2 py-1 w-32"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameList(list.id, renameValue)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameList(list.id, renameValue);
                          if (e.key === 'Escape') setRenamingListId(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span>{list.name}</span>
                    )}
                    <span className="text-xs text-gray-500">({list.count})</span>
                  </button>
                  <button
                    className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Rename"
                    onClick={() => {
                      setRenamingListId(list.id);
                      setRenameValue(list.name);
                    }}
                  ><Pencil size={16} /></button>
                  <button
                    className="text-xs text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete"
                    onClick={() => handleDeleteList(list.id)}
                  ><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Right Pane: FileUpload or Entries in List */}
        <div className="w-full md:flex-1 px-0 md:px-4">
          {selectedListId === 'new' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Create New List</h2>
              <FileUpload key={fileUploadKey} onUpload={handleFileUpload} />
            </div>
          )}
          {loading && <div className="mt-4 text-blue-600">Loading...</div>}
          {applicants.length > 0 && !loading && selectedListId !== 'new' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Entries in List</h2>
                <span className="text-gray-500">{applicants.filter(a => a.selected).length} selected</span>
              </div>
              {(() => {
                const meta = lists.find(l => l.id === selectedListId);
                if (!meta) return null;
                return (
                  <div className="mb-4 text-sm text-gray-500 flex gap-6">
                    <div>Created: {new Date(meta.createdAt).toLocaleString()}</div>
                    <div>Updated: {new Date(meta.updatedAt).toLocaleString()}</div>
                  </div>
                );
              })()}
              <div className="max-h-[60vh] overflow-y-auto">
                <ApplicantTable
                  applicants={applicants}
                  onApplicantsChange={setApplicants}
                  onDeleteRecipient={handleDeleteRecipient}
                  onEditRecipient={handleEditRecipient}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleNext}
                  className={`px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2 ${applicants.some(a => a.selected) ? 'hover:bg-blue-600 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  aria-label="Configure Templates"
                  disabled={!applicants.some(a => a.selected)}
                >
                  <span>Configure Templates</span>
                  <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          )}
          {!selectedListId && !loading && (
            <div className="text-gray-500 mt-12 text-center">Select a list to view its entries.</div>
          )}
        </div>
      </div>
    </main>
  );
}
