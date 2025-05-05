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
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
