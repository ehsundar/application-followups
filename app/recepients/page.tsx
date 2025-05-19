'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileUpload } from '../components/FileUpload';
import { ApplicantTable } from '../components/ApplicantTable';
import { Applicant } from '../types';
import { parseCSV } from '../utils';
import { Pencil, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface RecipientListMeta {
  id: string;
  name: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export default function Recepients() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth check
  useEffect(() => {
    fetch('/api/init').then((res) => {
      if (res.status !== 200) router.push('/login');
    }).catch(() => router.push('/login'));
  }, [router]);

  // Fetch recipient lists
  const { data: lists = [], isLoading: listsLoading } = useQuery<{ id: string; name: string; count: number; createdAt: string; updatedAt: string; }[]>({
    queryKey: ['recipientLists'],
    queryFn: async () => {
      const res = await fetch('/api/recepients/list');
      return res.json();
    },
  });

  // Selected list state
  const [selectedListId, setSelectedListId] = useState<string>('new');
  const [fileUploadKey, setFileUploadKey] = useState(0);
  const [renamingListId, setRenamingListId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Local applicants state for table editing
  const [localApplicants, setLocalApplicants] = useState<Applicant[]>([]);

  // Fetch applicants for selected list
  const {
    isLoading: applicantsLoading,
    refetch: refetchApplicants,
  } = useQuery<Applicant[]>({
    queryKey: ['applicants', selectedListId],
    queryFn: async (): Promise<Applicant[]> => {
      if (!selectedListId || selectedListId === 'new') return [];
      const res = await fetch(`/api/recepients/${selectedListId}/recipients`);
      const data: unknown = await res.json();
      if (!Array.isArray(data)) return [];
      type RecipientApi = {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        university?: string;
        researchField?: string;
      };
      return (data as RecipientApi[]).map((r) => ({
        id: r.id,
        email: r.email,
        name: (r.firstName || '') + (r.lastName ? ' ' + r.lastName : ''),
        university: r.university ?? '',
        emailDate: '',
        subject: r.researchField ?? '',
        selected: true,
      }));
    },
    enabled: !!selectedListId && selectedListId !== 'new',
    onSuccess: (data) => setLocalApplicants(data),
  });

  // Mutations
  const insertListMutation = useMutation({
    mutationFn: async ({ file, name }: { file: File; name: string }) => {
      const applicants = await parseCSV(file);
      const res = await fetch('/api/recepients/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, applicants }),
      });
      if (!res.ok) throw new Error('Failed to insert list');
      return res.json() as Promise<RecipientListMeta>;
    },
    onSuccess: (newList: RecipientListMeta) => {
      queryClient.invalidateQueries({ queryKey: ['recipientLists'] });
      setSelectedListId(newList.id);
      setFileUploadKey(k => k + 1);
    },
    onError: () => alert('Failed to insert list'),
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recepients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete list');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipientLists'] });
      setSelectedListId('new');
    },
    onError: () => alert('Failed to delete list'),
  });

  const renameListMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/recepients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to rename list');
      return { id, name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipientLists'] });
      setRenamingListId(null);
    },
    onError: () => alert('Failed to rename list'),
  });

  const deleteRecipientMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      if (!selectedListId) return;
      await fetch(`/api/recepients/${selectedListId}/recipients`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
    },
    onSuccess: () => refetchApplicants(),
  });

  const editRecipientMutation = useMutation({
    mutationFn: async ({ recipientId, data }: { recipientId: string; data: Partial<Applicant> }) => {
      if (!selectedListId) return;
      await fetch(`/api/recepients/${selectedListId}/recipients`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, data }),
      });
    },
    onSuccess: () => refetchApplicants(),
  });

  const handleFileUpload = (file: File, name: string) => {
    insertListMutation.mutate({ file, name });
  };

  const handleNext = () => {
    const meta = lists.find((l: RecipientListMeta) => l.id === selectedListId);
    if (meta) {
      localStorage.setItem('selectedListName', meta.name);
      const selectedApplicants = localApplicants.filter(a => a.selected);
      localStorage.setItem('selectedApplicants', JSON.stringify(selectedApplicants));
    } else {
      localStorage.removeItem('selectedListName');
      localStorage.removeItem('selectedApplicants');
    }
    router.push('/templates');
  };

  const handleDeleteList = (id: string) => {
    if (!window.confirm('Delete this list?')) return;
    deleteListMutation.mutate(id);
  };

  const handleRenameList = (id: string, name: string) => {
    renameListMutation.mutate({ id, name });
  };

  const handleDeleteRecipient = (recipientId: string) => {
    deleteRecipientMutation.mutate(recipientId);
  };

  const handleEditRecipient = (recipientId: string, data: Partial<Applicant>) => {
    editRecipientMutation.mutate({ recipientId, data });
  };

  const loading = listsLoading || applicantsLoading ||
    insertListMutation.status === 'loading' ||
    deleteListMutation.status === 'loading' ||
    renameListMutation.status === 'loading';

  return (
    <main className="container-fluid mx-auto p-4 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Application Follow-ups</h1>
        <button
          onClick={() => {
            setLocalApplicants([]);
            setSelectedListId('new');
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Start Over
        </button>
      </div>
      <div className="flex-1 flex flex-col md:flex-row  min-h-0">
        {/* Left Pane: Lists and New List Button */}
        <div className="md:w-1/3 md:min-w-[220px] md:max-w-[340px] md:border-r px-0 md:px-4 mb-6 md:mb-0 flex-shrink-0">
          <div className="mb-6">
            <div className="font-semibold mb-2">Your Lists</div>
            {listsLoading ? (
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
                {[...Array(7)].map((_, i) => (
                  <li key={i} className="animate-pulse px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 w-full h-8" />
                ))}
              </ul>
            ) : (
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
                {lists.map((list: RecipientListMeta) => (
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
                      className="text-xs text-blue-500 md:opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Rename"
                      onClick={() => {
                        setRenamingListId(list.id);
                        setRenameValue(list.name);
                      }}
                    ><Pencil size={16} /></button>
                    <button
                      className="text-xs text-red-500 md:opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete"
                      onClick={() => handleDeleteList(list.id)}
                    ><Trash2 size={16} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Right Pane: FileUpload or Entries in List */}
        <div className="md:w-2/3 flex-1 flex flex-col min-h-0 px-0 md:px-4">
          {selectedListId === 'new' && !listsLoading && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Create New List</h2>
              <FileUpload key={fileUploadKey} onUpload={handleFileUpload} />
            </div>
          )}
          {applicantsLoading && selectedListId !== 'new' && !listsLoading && (
            <div className="mt-4 space-y-4 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          )}
          {loading && selectedListId !== 'new' && !applicantsLoading && !listsLoading && <div className="mt-4 text-blue-600">Loading...</div>}
          {localApplicants.length > 0 && !loading && selectedListId !== 'new' && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Entries in List</h2>
                <span className="text-gray-500">{localApplicants.filter((a) => a.selected).length} selected</span>
              </div>
              {(() => {
                const meta = lists.find((l: RecipientListMeta) => l.id === selectedListId);
                if (!meta) return null;
                return (
                  <div className="mb-4 text-sm text-gray-500 flex gap-6">
                    <div>Created: {new Date(meta.createdAt).toLocaleString()}</div>
                    <div>Updated: {new Date(meta.updatedAt).toLocaleString()}</div>
                  </div>
                );
              })()}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <ApplicantTable
                  applicants={localApplicants}
                  onApplicantsChange={setLocalApplicants}
                  onDeleteRecipient={handleDeleteRecipient}
                  onEditRecipient={handleEditRecipient}
                />
              </div>
            </div>
          )}
          {selectedListId === '' && !loading && (
            <div className="text-gray-500 mt-12 text-center">Select a list to view its entries.</div>
          )}
        </div>
      </div>
      <div className="mt-6 flex w-full justify-center md:justify-end">
        <button
          onClick={handleNext}
          className={`w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded flex items-center justify-center gap-2 ${selectedListId === '' || selectedListId === 'new' || !localApplicants.some((a) => a.selected) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 cursor-pointer'}`}
          aria-label="Configure Templates"
          disabled={selectedListId === '' || selectedListId === 'new' || !localApplicants.some((a) => a.selected)}
        >
          <span>Configure Templates</span>
          <span className="text-xl">→</span>
        </button>
      </div>
    </main>
  );
}
