import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { hotelColumns } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';
import { mockHotels } from '@/lib/data';

export default function AgencyDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold">Hotelübersicht</h1>
        <Button asChild className='bg-accent text-accent-foreground hover:bg-accent/90'>
          <Link href="/admin/create-hotel">
            <PlusCircle className="mr-2 h-4 w-4" />
            Neues Hotel erstellen
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
