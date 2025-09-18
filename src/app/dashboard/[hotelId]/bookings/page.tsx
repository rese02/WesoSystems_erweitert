'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Booking } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { BookingDataTableRowActions } from '@/components/data-table/booking-data-table-row-actions';


const BookingStatusBadge = ({ status }: { status: Booking['status'] }) => (
  <Badge
    className={cn('capitalize', {
      'bg-green-100 text-green-800 border-green-200': status === 'Confirmed',
      'bg-yellow-100 text-yellow-800 border-yellow-200': status === 'Partial Payment',
      'bg-blue-100 text-blue-800 border-blue-200': status === 'Data Provided',
      'bg-orange-100 text-orange-800 border-orange-200': status === 'Pending',
      'bg-red-100 text-red-800 border-red-200': status === 'Cancelled',
    })}
    variant="outline"
  >
    {status}
  </Badge>
);

const formatDate = (timestamp: Timestamp | Date) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'dd.MM.yyyy', { locale: de });
};

type EnrichedBooking = Booking & { linkId?: string };

export default function BookingsPage() {
  const params = useParams<{ hotelId: string }>();
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.hotelId) return;
    const bookingsCollection = collection(db, 'hotels', params.hotelId, 'bookings');
    const q = query(bookingsCollection, orderBy('checkIn', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bookingsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];

      const enrichedBookings: EnrichedBooking[] = await Promise.all(
        bookingsList.map(async (booking) => {
          const linksCollection = collection(db, 'bookingLinks');
          const linkQuery = query(linksCollection, where('bookingId', '==', booking.id));
          const linkSnapshot = await getDocs(linkQuery);
          if (!linkSnapshot.empty) {
            const linkId = linkSnapshot.docs[0].id;
            return { ...booking, linkId };
          }
          return booking;
        })
      );
      
      setBookings(enrichedBookings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [params.hotelId]);

  const bookingColumns: ColumnDef<EnrichedBooking>[] = [
    { accessorKey: 'guestName', header: 'Gast' },
    { 
        accessorKey: 'checkIn', 
        header: 'Check-in',
        cell: ({ row }) => formatDate(row.getValue('checkIn'))
    },
    { 
        accessorKey: 'checkOut', 
        header: 'Check-out',
        cell: ({ row }) => formatDate(row.getValue('checkOut'))
    },
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
      cell: ({ row }) => <BookingDataTableRowActions row={row} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Buchungsübersicht</h1>
          <p className="mt-1 text-muted-foreground">
            Alle Buchungen für Ihr Hotel im Überblick.
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/${params.hotelId}/bookings/create`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Neue Buchung
          </Link>
        </Button>
      </div>
      <DataTable
        columns={bookingColumns}
        data={bookings}
        filterColumnId="guestName"
        filterPlaceholder="Buchungen filtern..."
        loading={loading}
      />
    </div>
  );
}
