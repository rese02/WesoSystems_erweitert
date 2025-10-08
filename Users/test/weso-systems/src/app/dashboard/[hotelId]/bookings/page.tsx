'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowUpDown, PlusCircle, Trash2, Clock, CheckCircle2, FileText, PieChart, Ban, BadgeCheck } from 'lucide-react';
import { DataTable } from '@/components/data-table/data-table';
import { 
  type ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
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
} from '@/components/ui/alert-dialog';
import { deleteBookingsAction } from '@/actions/hotel-actions';
import { useToast } from '@/hooks/use-toast';
import { AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const statusConfig: Record<BookingStatus, { label: string; icon: React.ElementType; color: string }> = {
  Pending: { label: 'Ausstehend', icon: Clock, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Data Provided': { label: 'Daten erhalten', icon: FileText, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Partial Payment': { label: 'Teilzahlung', icon: PieChart, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  Confirmed: { label: 'Bestätigt', icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200' },
  Completed: { label: 'Abgeschlossen', icon: BadgeCheck, color: 'bg-green-100 text-green-800 border-green-200' },
  Cancelled: { label: 'Storniert', icon: Ban, color: 'bg-red-100 text-red-800 border-red-200' },
};

const BookingStatusBadge = ({ status }: { status: Booking['status'] }) => {
    const config = statusConfig[status] || { label: status, icon: Clock, color: 'bg-gray-100 text-gray-800' };
    const Icon = config.icon;
    return (
        <Badge
            className={cn('capitalize gap-1.5', config.color)}
            variant="outline"
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
};

const PaymentStatusBadge = ({ booking }: { booking: Booking }) => {
    let status: 'Bezahlt' | 'Teilzahlung' | 'Ausstehend' = 'Ausstehend';
    let color = 'bg-orange-100 text-orange-800 border-orange-200';
    let icon = Clock;

    if (booking.status === 'Confirmed' || booking.status === 'Completed') {
        status = 'Bezahlt';
        color = 'bg-green-100 text-green-800 border-green-200';
        icon = CheckCircle2;
    } else if (booking.status === 'Partial Payment') {
        status = 'Teilzahlung';
        color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        icon = PieChart;
    }

    const Icon = icon;

    return (
        <Badge
            className={cn('capitalize gap-1.5', color)}
            variant="outline"
        >
            <Icon className="h-3 w-3" />
            {status}
        </Badge>
    );
};


const formatDate = (timestamp: Timestamp | Date | undefined, includeTime: boolean = false) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    const formatString = includeTime ? 'dd.MM.yyyy, HH:mm' : 'dd.MM.yyyy';
    return format(date, formatString, { locale: de });
};

type EnrichedBooking = Booking & { linkId?: string };

export default function BookingsPage() {
  const params = useParams<{ hotelId: string }>();
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rowSelection, setRowSelection] = useState({});
  const { toast } = useToast();


  useEffect(() => {
    if (!params.hotelId) return;

    const linksQuery = query(collection(db, 'bookingLinks'), where('hotelId', '==', params.hotelId));
    const bookingsCollection = collection(db, 'hotels', params.hotelId, 'bookings');
    const bookingsQuery = query(bookingsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(bookingsQuery, async (bookingsSnapshot) => {
      const bookingsList = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];

      // Fetch links only once and create a map for quick lookup
      const linkSnapshot = await getDocs(linksQuery);
      const linksMap = new Map<string, string>(); // Map<bookingId, linkId>
      linkSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.bookingId) {
          linksMap.set(data.bookingId, doc.id);
        }
      });

      const enrichedBookings: EnrichedBooking[] = bookingsList.map(booking => ({
        ...booking,
        linkId: linksMap.get(booking.id),
      }));
      
      setBookings(enrichedBookings);
      setLoading(false);
    }, 
    (error) => {
      const permissionError = new FirestorePermissionError({
        path: bookingsCollection.path,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', permissionError);
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
    {
        accessorKey: 'id',
        header: 'Buchungs-ID',
        cell: ({ row }) => <div className="font-mono uppercase">{row.getValue<string>('id').substring(0, 6)}</div>
    },
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
        id: 'lastChange',
        accessorFn: row => row.updatedAt || row.createdAt,
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Letzte Änderung
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
            const date = row.getValue('lastChange') as Timestamp | Date;
            return formatDate(date, true);
        },
        sortingFn: 'datetime',
    },
    {
      id: 'paymentStatus',
      header: 'Zahlungsstatus',
      cell: ({ row }) => <PaymentStatusBadge booking={row.original} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => <BookingDataTableRowActions row={row} />,
    },
  ];

  const table = useReactTable({
    data: filteredBookings,
    columns: bookingColumns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex: false,
    initialState: {
      sorting: [{ id: 'lastChange', desc: true }]
    }
  });
  
  const selectedBookingIds = useMemo(() => {
    const selectedRows = table.getSelectedRowModel().flatRows;
    return selectedRows.map(row => (row.original as Booking).id);
  }, [rowSelection, table]);

  const handleDeleteSelected = async () => {
    if (selectedBookingIds.length === 0) return;
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
          <h1 className="font-headline text-3xl font-bold">Aktuelle Buchungen</h1>
          <p className="mt-1 text-muted-foreground">
            Durchsuchen und filtern Sie Ihre Buchungen oder wählen Sie Buchungen aus, um sie gesammelt zu löschen.
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
        filterPlaceholder="Name, ID..."
        loading={loading}
        table={table}
        toolbarContent={
            <>
                {selectedBookingIds.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Löschen ({selectedBookingIds.length})
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
                 <div className='flex items-center gap-2 ml-auto'>
                    <span className="text-sm text-muted-foreground">Status filtern</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Status filtern" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Alle Status</SelectItem>
                            {Object.keys(statusConfig).map((status, index) => (
                              <SelectItem key={status + index} value={status}>{statusConfig[status as BookingStatus].label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
            </>
        }
      />
    </div>
  );
}
