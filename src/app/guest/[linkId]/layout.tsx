import { Building } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { notFound } from 'next/navigation';

async function getHotelName(linkId: string): Promise<string> {
    const linkRef = doc(db, 'bookingLinks', linkId);
    const linkSnap = await getDoc(linkRef);

    // Link muss existieren für das Layout
    if (!linkSnap.exists()) {
        notFound();
    }
    
    // Jetzt wissen wir, dass der Link gültig ist, holen wir die Booking-Daten daraus
    const booking = linkSnap.data().booking;
    if (!booking || !booking.hotelId) {
        // Dies würde auf ein Datenintegritätsproblem hinweisen
        console.error('Booking-Daten oder hotelId fehlen im booking link:', linkId);
        notFound();
    }
    
    const hotelRef = doc(db, 'hotels', booking.hotelId);
    const hotelSnap = await getDoc(hotelRef);

    if (hotelSnap.exists()) {
        return hotelSnap.data().hotelName;
    }

    // Fallback-Hotelname, falls etwas schiefgeht
    return 'Ihr Hotel';
}

export default async function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { linkId: string };
}) {
  const hotelName = await getHotelName(params.linkId);
  return (
    <div>
      <header className="flex h-16 items-center border-b px-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Building className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg">{hotelName}</span>
        </div>
      </header>
      <main className="bg-muted/40 p-4 sm:p-8">{children}</main>
      <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WesoSystems. All rights reserved.
      </footer>
    </div>
  );
}
