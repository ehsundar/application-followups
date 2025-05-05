import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Checkbox } from './ui/checkbox';
import { Applicant } from '../types';

interface ApplicantTableProps {
  applicants: Applicant[];
  onApplicantsChange: (applicants: Applicant[]) => void;
}

export function ApplicantTable({ applicants, onApplicantsChange }: ApplicantTableProps) {
  const columnHelper = createColumnHelper<Applicant>();

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(value) => {
            const newApplicants = applicants.map(applicant => ({
              ...applicant,
              selected: !!value
            }));
            onApplicantsChange(newApplicants);
          }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.selected}
          onCheckedChange={(value) => {
            const newApplicants = applicants.map(applicant =>
              applicant.email === row.original.email
                ? { ...applicant, selected: !!value }
                : applicant
            );
            onApplicantsChange(newApplicants);
          }}
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
  ], [applicants, onApplicantsChange]);

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
