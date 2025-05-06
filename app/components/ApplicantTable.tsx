import { useMemo } from 'react';
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
}

export function ApplicantTable({ applicants, onApplicantsChange }: ApplicantTableProps) {
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
    }),
    columnHelper.accessor('email', {
      header: 'Email',
    }),
    columnHelper.accessor('university', {
      header: 'University',
    }),
    columnHelper.accessor('emailDate', {
      header: 'Email Date',
    }),
    columnHelper.accessor('subject', {
      header: 'Subject',
    }),
  ], [columnHelper, applicants, onApplicantsChange]);

  const table = useReactTable({
    data: applicants,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
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
  );
}
