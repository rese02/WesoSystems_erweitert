import { BookingSummaryCard } from '@/components/guest/booking-summary-card';
import { BookingWizard } from '@/components/guest/booking-wizard';
import { db } from '@/lib/firebase/client';
import { GuestLinkData } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';


async function getBookingLinkData(linkId: string): Promise<GuestLinkData | null> {
    const linkRef = doc(db, 'bookingLinks', linkId);
    const linkSnap = await getDoc(linkRef);

    if (!linkSnap.exists() || linkSnap.data().status === 'used') {
        return null;
    }
    
    const data = linkSnap.data();
    const booking = data.booking;

    const hotelRef = doc(db, 'hotels', booking.hotelId);
    const hotelSnap = await getDoc(hotelRef);

    if (!hotelSnap.exists()) {
        return null;
    }
    const hotel = hotelSnap.data();


    return { 
        id: linkSnap.id, 
        booking, 
        hotel: { id: hotelSnap.id, ...hotel } as any // Type assertion for simplicity
    };
}


export default async function GuestBookingPage({
  params,
}: {
  params: { linkId: string };
}) {

  const linkData = await getBookingLinkData(params.linkId);

  if (!linkData) {
     notFound();
  }

  if (linkData.booking.status !== 'Pending') {
    return (
        <div className="mx-auto max-w-2xl py-12">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Buchung bereits bearbeitet</AlertTitle>
              <AlertDescription>
                Die Daten für diese Buchung wurden bereits übermittelt. Sie müssen nichts weiter tun.
              </AlertDescription>
            </Alert>
        </div>
     )
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <BookingWizard linkId={params.linkId} />
      </div>
      <div className="lg:col-span-1">
        <BookingSummaryCard booking={linkData.booking} />
      </div>
    </div>
  );
}
