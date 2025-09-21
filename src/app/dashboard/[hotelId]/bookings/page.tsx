'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpDown, PlusCircle, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { Booking, BookingStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { BookingDataTableRowActions } from '@/components/data-table/booking-data-table-row-actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteBookingsAction } from '@/actions/hotel-actions';
import { useToast } from '@/hooks/use-toast';


const BookingStatusBadge = ({ status }: { status: Booking['status'] }) => (
  <Badge
    className={cn('capitalize', {
      'bg-green-100 text-green-800 border-green-200': status === 'Confirmed' || status === 'Data Provided',
      'bg-yellow-100 text-yellow-800 border-yellow-200': status === 'Partial Payment',
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

const ALL_STATUSES: BookingStatus[] = ['Pending', 'Data Provided', 'Partial Payment', 'Confirmed', 'Cancelled'];

export default function BookingsPage() {
  const params = useParams<{ hotelId: string }>();
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rowSelection, setRowSelection] = useState({});
  const { toast } = useToast();


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
  
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') {
      return bookings;
    }
    return bookings.filter(booking => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const bookingColumns: ColumnDef<EnrichedBooking>[] = [
    {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Alle auswählen"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Zeile auswählen"
          />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    { accessorKey: 'guestName', header: 'Gast' },
    { 
        accessorKey: 'checkIn', 
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Check-in
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatDate(row.getValue('checkIn'))
    },
    { 
        accessorKey: 'checkOut', 
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Check-out
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatDate(row.getValue('checkOut'))
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <BookingStatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <div className="text-right">
          <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Preis
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('price'));
        const formatted = new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <BookingDataTableRowActions row={row} />,
    },
  ];

  const selectedBookingIds = useMemo(() => {
    return Object.keys(rowSelection).map(index => bookings[parseInt(index)].id);
  }, [rowSelection, bookings]);

  const handleDeleteSelected = async () => {
    const result = await deleteBookingsAction(params.hotelId, selectedBookingIds);
    if (result.success) {
      toast({
        title: 'Erfolgreich gelöscht',
        description: result.message,
      });
      setRowSelection({}); // Reset selection
    } else {
      toast({
        title: 'Fehler beim Löschen',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

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
        data={filteredBookings}
        filterColumnId="guestName"
        filterPlaceholder="Buchungen filtern..."
        loading={loading}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        toolbarContent={
            <>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Status filtern" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Alle Status</SelectItem>
                        {ALL_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedBookingIds.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="ml-2">
                                <Trash2 className="mr-2 h-4 w-4" />
                                {selectedBookingIds.length} löschen
                            </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Diese Aktion kann nicht rückgängig gemacht werden. Dies wird {selectedBookingIds.length} Buchung(en) und alle zugehörigen Daten dauerhaft von den Servern löschen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </>
        }
      />
    </div>
  );
}
