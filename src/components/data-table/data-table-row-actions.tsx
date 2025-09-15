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
import { Hotel } from '@/lib/types';
import { deleteHotelAction } from '@/actions/hotel-actions';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function HotelDataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { toast } = useToast();
  const hotel = row.original as Hotel;

  const copyLoginLink = () => {
    navigator.clipboard.writeText('https://weso.systems/hotel/login-link-placeholder');
    toast({
      title: 'Link kopiert!',
      description: 'Der Login-Link wurde in die Zwischenablage kopiert.',
    });
  };

  const handleDelete = async () => {
    const result = await deleteHotelAction(hotel.id);
    if (result.success) {
      toast({
        title: 'Hotel gelöscht',
        description: 'Das Hotel wurde erfolgreich entfernt.',
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
            <Link href={`/dashboard/${hotel.id}`}>Hotelier-Dashboard ansehen</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Einstellungen</DropdownMenuItem>
          <DropdownMenuItem onClick={copyLoginLink}>
            Login-Link kopieren
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Löschen
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Das Hotel und
            alle zugehörigen Daten werden dauerhaft gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Fortfahren
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
