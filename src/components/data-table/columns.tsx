'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { Hotel } from '@/lib/types';
import { HotelDataTableRowActions } from './data-table-row-actions';
import { Button } from '../ui/button';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

export const hotelColumns: ColumnDef<Hotel>[] = [
  {
    accessorKey: 'hotelName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Hotelname
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const hotel = row.original as Hotel;
      return (
        <Link href={`/dashboard/${hotel.id}`} className="font-medium hover:underline">
          {row.getValue('hotelName')}
        </Link>
      );
    },
  },
  {
    accessorKey: 'domain',
    header: 'Domain',
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Erstellt am
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        const formatted = date.toLocaleDateString('de-DE');
        return <div>{formatted}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <HotelDataTableRowActions row={row} />,
  },
];
