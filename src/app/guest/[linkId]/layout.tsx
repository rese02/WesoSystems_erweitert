import { Building } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Hotel } from '@/lib/types';


async function getHotelData(linkId: string): Promise<Hotel | null> {
    const linkRef = doc(db, 'bookingLinks', linkId);
    const linkSnap = await getDoc(linkRef);

    if (!linkSnap.exists()) {
        notFound();
    }
    
    const booking = linkSnap.data()?.booking;
    if (!booking || !booking.hotelId) {
        console.error('Booking-Daten oder hotelId fehlen im booking link:', linkId);
        notFound();
    }
    
    const hotelRef = doc(db, 'hotels', booking.hotelId);
    const hotelSnap = await getDoc(hotelRef);

    if (hotelSnap.exists()) {
        return hotelSnap.data() as Hotel;
    }

    return null;
}

export default async function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { linkId: string };
}) {
  const hotel = await getHotelData(params.linkId);
  return (
    <div className='bg-muted/40 min-h-screen flex flex-col'>
      <header className="flex h-20 items-center justify-center border-b bg-background px-4 sm:px-6">
        {hotel?.logoUrl ? (
            <div className='relative h-16 w-32'>
                <Image src={hotel.logoUrl} alt={hotel.hotelName} fill className="object-contain" />
            </div>
        ) : (
             <div className="flex items-center gap-2 font-semibold">
                <Building className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg">{hotel?.hotelName || "Hotel"}</span>
            </div>
        )}
      </header>
      <main className="flex-1 p-4 sm:p-8">{children}</main>
      <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {hotel?.hotelName || "WesoSystems"}. All rights reserved.
      </footer>
    </div>
  );
}
