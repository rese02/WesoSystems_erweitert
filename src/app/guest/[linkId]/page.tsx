import { BookingSummaryCard } from '@/components/guest/booking-summary-card';
import { BookingWizard } from '@/components/guest/booking-wizard';
import { db } from '@/lib/firebase/client';
import { GuestLinkData, Hotel, Booking } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';


async function getBookingLinkData(linkId: string): Promise<GuestLinkData | null> {
    const linkRef = doc(db, 'bookingLinks', linkId);
    const linkSnap = await getDoc(linkRef);

    // First, check if the link itself is valid and not used
    if (!linkSnap.exists() || linkSnap.data().status === 'used') {
        return null; // This will trigger a notFound() in the page component
    }
    
    const data = linkSnap.data();
    const bookingData = data.booking; // The booking data is now directly embedded here

    if (!bookingData || !bookingData.hotelId) {
        console.error('Booking data integrity issue for linkId:', linkId);
        return null;
    }

    const hotelRef = doc(db, 'hotels', bookingData.hotelId);
    const hotelSnap = await getDoc(hotelRef);

    if (!hotelSnap.exists()) {
        console.error('Hotel not found for booking:', bookingData.id);
        return null;
    }
    const hotel = hotelSnap.data();
    
    // Convert Timestamps to serializable Date objects
    const booking: Booking = {
      ...bookingData,
      checkIn: bookingData.checkIn.toDate(),
      checkOut: bookingData.checkOut.toDate(),
      createdAt: bookingData.createdAt.toDate(),
    };


    // Reconstruct the full object to pass to the components
    return { 
        id: linkSnap.id, 
        booking, // The complete booking object with serializable dates
        hotel: { id: hotelSnap.id, ...hotel } as Hotel
    };
}


export default async function GuestBookingPage({
  params,
}: {
  params: { linkId: string };
}) {

  const linkData = await getBookingLinkData(params.linkId);

  // If the link is invalid or data is inconsistent, show a 404 page
  if (!linkData) {
     notFound();
  }

  // The guest form should only be accessible if the booking is 'Pending'
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

  // If status is 'Pending', show the wizard to the guest
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <BookingWizard linkId={params.linkId} initialData={linkData} />
      </div>
      <div className="lg:col-span-1">
        <BookingSummaryCard booking={linkData.booking} />
      </div>
    </div>
  );
}
