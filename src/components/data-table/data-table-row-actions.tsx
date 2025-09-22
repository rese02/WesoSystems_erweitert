'use client';

import { Copy, KeyRound, MoreHorizontal, UserX } from 'lucide-react';
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


  const handleDelete = async () => {
    const result = await deleteHotelAction(hotel.id);
    if (result.success) {
      toast({
        title: 'Hotel gelöscht',
        description: result.message,
      });
    } else {
      toast({
        title: 'Fehler',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  const copyLoginLink = () => {
    const link = `${window.location.origin}/hotel/login`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Login-Link kopiert!',
      description: 'Der Link zur Hotel-Login-Seite wurde kopiert.',
    });
  };

  const copyCredentials = () => {
    if (!hotel.hotelier?.email || !hotel.hotelier?.password) {
      toast({
        title: 'Passwort nicht verfügbar',
        description: 'Das Passwort wurde bei der Erstellung generiert und wird aus Sicherheitsgründen nicht erneut angezeigt. Sie können im Profil ein neues setzen.',
        variant: 'destructive',
      });
      return;
    }
    const credentials = `E-Mail: ${hotel.hotelier.email}\nPasswort: ${hotel.hotelier.password}`;
    navigator.clipboard.writeText(credentials);
    toast({
      title: 'Zugangsdaten kopiert!',
      description: 'E-Mail und Passwort wurden in die Zwischenablage kopiert.',
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
        <DropdownMenuContent align="end" className="w-[220px]">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/${hotel.id}`}>Hotelier-Dashboard ansehen</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
             <Link href={`/dashboard/${hotel.id}/settings`}>Einstellungen</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem onClick={copyLoginLink}>
            <Copy className="mr-2 h-4 w-4" />
            <span>Login-Link kopieren</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyCredentials}>
             <KeyRound className="mr-2 h-4 w-4" />
            <span>Initiale Zugangsdaten kopieren</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
             <UserX className="mr-2 h-4 w-4" />
              Hotel & Benutzer löschen
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sind Sie absolut sicher?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Das Hotel, alle Buchungen und der zugehörige Hotelier-Benutzeraccount werden dauerhaft gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Fortfahren und löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}