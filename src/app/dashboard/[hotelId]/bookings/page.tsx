'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { mockBookings } from '@/lib/data';
import { type ColumnDef } from '@tanstack/react-table';
import { Booking } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useParams } from 'next/navigation';

const BookingStatusBadge = ({ status }: { status: Booking['status'] }) => (
  <Badge
    className={cn('text-white', {
      'bg-green-500': status === 'Confirmed',
      'bg-yellow-500': status === 'Partial Payment',
      'bg-blue-500': status === 'Sent',
      'bg-red-500': status === 'Cancelled',
    })}
    variant="default"
  >
    {status}
  </Badge>
);

const bookingColumns: ColumnDef<Booking>[] = [
  { accessorKey: 'guestName', header: 'Gastname' },
  { accessorKey: 'checkIn', header: 'Check-in' },
  { accessorKey: 'checkOut', header: 'Check-out' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <BookingStatusBadge status={row.getValue('status')} />,
  },
  {
    accessorKey: 'price',
    header: 'Preis',
    cell: ({ row }) =>
      `€${(row.getValue('price') as number).toFixed(2)}`,
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Menü öffnen</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Buchung ansehen</DropdownMenuItem>
          <DropdownMenuItem>Status ändern</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function BookingsPage() {
  const params = useParams<{ hotelId: string }>();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold">Buchungsübersicht</h1>
      </div>
      <DataTable
        columns={bookingColumns}
        data={mockBookings}
        filterColumnId="guestName"
        filterPlaceholder="Buchungen nach Gastname filtern..."
      />
    </div>
  );
}
