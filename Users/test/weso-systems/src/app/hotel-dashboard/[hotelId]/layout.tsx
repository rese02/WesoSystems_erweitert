import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { db } from '@/lib/firebase/client';
import { Hotel } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';

async function getHotelData(hotelId: string): Promise<Hotel> {
  const hotelRef = doc(db, 'hotels', hotelId);
  const hotelSnap = await getDoc(hotelRef);
  if (hotelSnap.exists()) {
    return hotelSnap.data() as Hotel;
  }
  notFound();
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { hotelId: string };
}) {
  const hotelData = await getHotelData(params.hotelId);

  return (
    <SidebarProvider>
      <DashboardSidebar role="hotelier" hotelId={params.hotelId} hotelName={hotelData.hotelName} />
      <SidebarInset>
        <DashboardHeader hotelData={hotelData} />
        <main className="p-4 sm:p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
