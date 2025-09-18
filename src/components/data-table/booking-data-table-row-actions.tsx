
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
import { Booking } from '@/lib/types';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

type EnrichedBooking = Booking & { linkId?: string };


export function BookingDataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { toast } = useToast();
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
          <DropdownMenuItem>
             Buchung ansehen
          </DropdownMenuItem>
          <DropdownMenuItem>
            Buchung bearbeiten
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyBookingLink}>
            Buchungslink kopieren
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem>
            Status ändern
          </DropdownMenuItem>
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
            // onClick={handleDelete}
          >
            Fortfahren
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
