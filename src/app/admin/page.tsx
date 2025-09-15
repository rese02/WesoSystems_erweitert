import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { hotelColumns } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';
import { mockHotels } from '@/lib/data';

export default function AgencyDashboardPage() {
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
        data={mockHotels}
        filterColumnId="hotelName"
        filterPlaceholder="Hotels filtern..."
      />
    </div>
  );
}
