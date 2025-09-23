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

function AgencyDashboard() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const newPassword = searchParams.get('newPassword');


  useEffect(() => {
    const hotelsCollection = collection(db, 'hotels');
    const q = query(hotelsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const hotelsList = snapshot.docs.map((doc) => {
          const data = doc.data();

          // Handle Timestamp conversion safely
          const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : new Date().toISOString();

          // After creating a new hotel, we get the password passed as a search param.
          // We find the corresponding hotel (most recent one) and attach the password to it
          // so it can be copied. This only happens once.
          let hotelier = data.hotelier;
          if (newPassword && snapshot.docs[0].id === doc.id) {
             hotelier = { ...hotelier, password: newPassword };
          }
          
          return {
            id: doc.id,
            ...data,
            hotelier: hotelier,
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
  }, [newPassword]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Hotelübersicht</h1>
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
  );
}

export default function AgencyDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgencyDashboard />
    </Suspense>
  )
}
