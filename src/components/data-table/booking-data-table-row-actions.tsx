'use client';

import { MoreHorizontal } from 'lucide-react';
import { type Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
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
import Link from 'next/link';
import { Booking, BookingStatus } from '@/lib/types';
import { useParams } from 'next/navigation';
import { updateBookingStatus } from '@/actions/hotel-actions';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

type EnrichedBooking = Booking & { linkId?: string };

const ALL_STATUSES: BookingStatus[] = ['Pending', 'Data Provided', 'Partial Payment', 'Confirmed', 'Cancelled'];

export function BookingDataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { toast } = useToast();
  const params = useParams<{ hotelId: string }>();
  const booking = row.original as EnrichedBooking;

  const copyBookingLink = () => {
    if (!booking.linkId) {
       toast({
        title: 'Fehler',
        description: 'Für diese Buchung konnte kein Link gefunden werden.',
        variant: 'destructive',
      });
      return;
    }
    const bookingLink = `${window.location.origin}/guest/${booking.linkId}`;
    navigator.clipboard.writeText(bookingLink);
    toast({
      title: 'Link kopiert!',
      description: 'Der Buchungs-Link für den Gast wurde in die Zwischenablage kopiert.',
    });
  };

  const handleStatusChange = async (newStatus: BookingStatus) => {
    const result = await updateBookingStatus(params.hotelId, booking.id, newStatus);
    if (result.success) {
      toast({
        title: 'Status aktualisiert!',
        description: `Der Buchungsstatus wurde auf "${newStatus}" geändert.`,
      });
    } else {
      toast({
        title: 'Fehler',
        description: result.message,
        variant: 'destructive',
      });
    }
  };


  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Menü öffnen</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem asChild>
             <Link href={`/dashboard/${params.hotelId}/bookings/${booking.id}`}>Buchung ansehen</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/${params.hotelId}/bookings/create`}>Buchung bearbeiten</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyBookingLink}>
            Buchungslink kopieren
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status ändern</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    {ALL_STATUSES.map(status => (
                         <DropdownMenuItem 
                            key={status} 
                            onClick={() => handleStatusChange(status)}
                            disabled={status === booking.status}
                        >
                            {status}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
           </DropdownMenuSub>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Stornieren
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Buchung stornieren?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Die Buchung wird als "Storniert" markiert.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={() => handleStatusChange('Cancelled')}
          >
            Fortfahren
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
