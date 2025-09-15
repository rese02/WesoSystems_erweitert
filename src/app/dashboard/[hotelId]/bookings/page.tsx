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
    className={cn('text-white capitalize', {
      'bg-green-600 hover:bg-green-600/90': status === 'Confirmed',
      'bg-yellow-500 hover:bg-yellow-500/90': status === 'Partial Payment',
      'bg-blue-500 hover:bg-blue-500/90': status === 'Sent',
      'bg-red-600 hover:bg-red-600/90': status === 'Cancelled',
    })}
    variant="default"
  >
    {status}
  </Badge>
);

const bookingColumns: ColumnDef<Booking>[] = [
  { accessorKey: 'guestName', header: 'Gast' },
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
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: 'actions',
    cell: () => (
      <div className="text-right">
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
      </div>
    ),
  },
];

export default function BookingsPage() {
  const params = useParams<{ hotelId: string }>();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Buchungsübersicht</h1>
          <p className="mt-1 text-muted-foreground">
            Alle Buchungen für Ihr Hotel im Überblick.
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={`/dashboard/${params.hotelId}/bookings/create`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Neue Buchung
          </Link>
        </Button>
      </div>
      <DataTable
        columns={bookingColumns}
        data={mockBookings}
        filterColumnId="guestName"
        filterPlaceholder="Buchungen filtern..."
      />
    </div>
  );
}
