'use client';

import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {PlusCircle} from 'lucide-react';
import {hotelColumns} from '@/components/data-table/columns';
import {DataTable} from '@/components/data-table/data-table';
import {db} from '@/lib/firebase/client';
import {collection, onSnapshot, orderBy, query, Timestamp} from 'firebase/firestore';
import {Hotel} from '@/lib/types';
import {useEffect, useState, Suspense} from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';


function AgencyDashboard() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const password = searchParams.get('newPassword');
    if (password) {
      setNewPassword(password);
      setShowPasswordModal(true);
      window.history.replaceState(null, '', '/admin');
    }
  }, [searchParams]);


  useEffect(() => {
    const hotelsCollection = collection(db, 'hotels');
    const q = query(hotelsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const hotelsList = snapshot.docs.map((doc) => {
          const data = doc.data();

          const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : new Date().toISOString();
          
          return {
            id: doc.id,
            ...data,
            hotelier: data.hotelier,
            createdAt: createdAt,
          } as Hotel;
        });
        
        setHotels(hotelsList);
        setLoading(false);

      },
      (error) => {
        console.error('Error fetching hotels:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const copyPasswordToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      toast({
        title: 'Passwort kopiert!',
        description: 'Das Passwort wurde in die Zwischenablage kopiert.',
      });
    }
  };

  return (
    <>
      <AlertDialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Passwort für neuen Hotelier</AlertDialogTitle>
            <AlertDialogDescription>
              WICHTIG: Dies ist die einzige Anzeige des Passworts. Kopieren Sie es und geben Sie es sicher an den Hotelier weiter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Badge variant="outline" className="my-4 justify-center rounded-md bg-muted p-4 font-mono text-center text-lg tracking-wider">
            {newPassword}
          </Badge>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Schließen</Button>
            <AlertDialogAction onClick={copyPasswordToClipboard}>Passwort kopieren</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Hotelübersicht</h1>
            <p className="mt-1 text-muted-foreground">
              Verwalten Sie alle Ihre Hotelpartner an einem Ort.
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/create-hotel">
              <PlusCircle className="mr-2 h-4 w-4" />
              Neues Hotel anlegen
            </Link>
          </Button>
        </div>
        <DataTable
          columns={hotelColumns}
          data={hotels}
          filterColumnId="hotelName"
          filterPlaceholder="Hotels filtern..."
          loading={loading}
        />
      </div>
    </>
  );
}

export default function AgencyDashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center">Loading...</div>}>
      <AgencyDashboard />
    </Suspense>
  )
}
