import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';

async function getHotelName(hotelId: string) {
  const hotelRef = doc(db, 'hotels', hotelId);
  const hotelSnap = await getDoc(hotelRef);
  if (hotelSnap.exists()) {
    return hotelSnap.data().hotelName;
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
  const hotelName = await getHotelName(params.hotelId);

  return (
    <SidebarProvider>
      <DashboardSidebar role="hotelier" hotelId={params.hotelId} hotelName={hotelName} />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
