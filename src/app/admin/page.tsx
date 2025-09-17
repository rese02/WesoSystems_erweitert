import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { hotelColumns } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Hotel } from '@/lib/types';

async function getHotels(): Promise<Hotel[]> {
  const hotelsCollection = collection(db, 'hotels');
  const q = query(hotelsCollection, orderBy('createdAt', 'desc'));
  const hotelsSnapshot = await getDocs(q);
  const hotelsList = hotelsSnapshot.docs.map((doc) => {
    const data = doc.data();
    // Convert Firestore Timestamp to a simple string or number.
    // Here, we'll convert it to an ISO string.
    const createdAt = data.createdAt.toDate().toISOString();
    return {
      id: doc.id,
      ...data,
      createdAt: createdAt,
    } as Hotel;
  });
  return hotelsList;
}

export default async function AgencyDashboardPage() {
  const hotels = await getHotels();

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
      />
    </div>
  );
}
