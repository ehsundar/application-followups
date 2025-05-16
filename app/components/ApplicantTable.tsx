import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Applicant } from '../types';

interface ApplicantTableProps {
  applicants: Applicant[];
  onApplicantsChange: (applicants: Applicant[]) => void;
  onDeleteRecipient?: (id: string) => void;
  onEditRecipient?: (id: string, data: Partial<Applicant>) => void;
}

export function ApplicantTable({ applicants, onApplicantsChange, onDeleteRecipient, onEditRecipient }: ApplicantTableProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Applicant>>({});
  const columnHelper = createColumnHelper<Applicant>();

  const columns = useMemo(() => [
    columnHelper.accessor('selected', {
      header: '',
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.original.selected}
          onChange={(e) => {
            const newApplicants = [...applicants];
            newApplicants[row.index] = {
              ...newApplicants[row.index],
              selected: e.target.checked
            };
            onApplicantsChange(newApplicants);
          }}
          className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-gray-600 rounded"
        />
      ),
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: ({ row }) => editIdx === row.index ? (
        <input
          className="border rounded px-2 py-1 w-full"
          value={editData.name ?? row.original.name}
          onChange={e => setEditData({ ...editData, name: e.target.value })}
        />
      ) : row.original.name,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: ({ row }) => editIdx === row.index ? (
        <input
          className="border rounded px-2 py-1 w-full"
          value={editData.email ?? row.original.email}
          onChange={e => setEditData({ ...editData, email: e.target.value })}
        />
      ) : row.original.email,
    }),
    columnHelper.accessor('university', {
      header: 'University',
      cell: ({ row }) => editIdx === row.index ? (
        <input
          className="border rounded px-2 py-1 w-full"
          value={editData.university ?? row.original.university}
          onChange={e => setEditData({ ...editData, university: e.target.value })}
        />
      ) : row.original.university,
    }),
    columnHelper.accessor('emailDate', {
      header: 'Email Date',
      cell: ({ row }) => editIdx === row.index ? (
        <input
          className="border rounded px-2 py-1 w-full"
          value={editData.emailDate ?? row.original.emailDate}
          onChange={e => setEditData({ ...editData, emailDate: e.target.value })}
        />
      ) : row.original.emailDate,
    }),
    columnHelper.accessor('subject', {
      header: 'Subject',
      cell: ({ row }) => editIdx === row.index ? (
        <input
          className="border rounded px-2 py-1 w-full"
          value={editData.subject ?? row.original.subject}
          onChange={e => setEditData({ ...editData, subject: e.target.value })}
        />
      ) : row.original.subject,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {editIdx === row.index ? (
            <>
              <button
                className="text-green-600"
                onClick={() => {
                  const newApplicants = [...applicants];
                  newApplicants[row.index] = { ...newApplicants[row.index], ...editData };
                  onApplicantsChange(newApplicants);
                  if (onEditRecipient && row.original.id) onEditRecipient(row.original.id, editData);
                  setEditIdx(null);
                  setEditData({});
                }}
              >Save</button>
              <button
                className="text-gray-500"
                onClick={() => {
                  setEditIdx(null);
                  setEditData({});
                }}
              >Cancel</button>
            </>
          ) : (
            <>
              <button
                className="text-blue-600"
                onClick={() => {
                  setEditIdx(row.index);
                  setEditData(row.original);
                }}
              >Edit</button>
              <button
                className="text-red-600"
                onClick={() => {
                  if (onDeleteRecipient && row.original.id) onDeleteRecipient(row.original.id);
                  const newApplicants = applicants.filter((_, i) => i !== row.index);
                  onApplicantsChange(newApplicants);
                }}
              >Delete</button>
            </>
          )}
        </div>
      ),
    }),
  ], [columnHelper, applicants, onApplicantsChange, editIdx, editData, onDeleteRecipient, onEditRecipient]);

  const table = useReactTable({
    data: applicants,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col h-full min-h-0 overflow-x-auto">
      <div className="flex-1 min-h-0 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
