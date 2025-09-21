import { BookingSummaryCard } from '@/components/guest/booking-summary-card';
import { BookingWizard } from '@/components/guest/booking-wizard';
import { db } from '@/lib/firebase/client';
import { GuestLinkData, Hotel, Booking } from '@/lib/types';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { notFound, redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';


async function getBookingLinkData(linkId: string): Promise<GuestLinkData | null> {
    const linkRef = doc(db, 'bookingLinks', linkId);
    const linkSnap = await getDoc(linkRef);

    if (!linkSnap.exists()) {
        return null; // Wird zu notFound() in der Page-Komponente
    }
    
    const linkData = linkSnap.data();
    const bookingDataFromLink = linkSnap.data()?.booking as Booking;
     
    // Wenn der Link genutzt wurde, hole die finalen Daten direkt aus der Hotel-Buchung
    if (linkData.status === 'used' && bookingDataFromLink) {
        const hotelBookingRef = doc(db, 'hotels', bookingDataFromLink.hotelId, 'bookings', bookingDataFromLink.id);
        const hotelBookingSnap = await getDoc(hotelBookingRef);
        if (hotelBookingSnap.exists()) {
            // Wenn die finale Buchung existiert, setzen wir den Status auf "Data Provided"
            // um die Weiterleitung zur Danke-Seite auszulösen.
             return {
                id: linkSnap.id,
                booking: { status: 'Data Provided' } as Booking,
                hotel: {} as Hotel,
            };
        }
    }
    
    // Wenn der Link noch aktiv ist, aber die Buchungsdaten fehlen -> Fehler
    const bookingData = linkData.booking as Booking;
    if (!bookingData || !bookingData.hotelId) {
        console.error('Integritätsproblem der Buchungsdaten für linkId:', linkId);
        return null;
    }

    const hotelRef = doc(db, 'hotels', bookingData.hotelId);
    const hotelSnap = await getDoc(hotelRef);

    if (!hotelSnap.exists()) {
        console.error('Hotel für Buchung nicht gefunden:', bookingData.id);
        return null;
    }
    const hotelData = hotelSnap.data();
    
    // Konvertiere Timestamps in serialisierbare Date-Objekte
    const booking: Booking = {
      ...bookingData,
      checkIn: bookingData.checkIn instanceof Timestamp ? bookingData.checkIn.toDate() : new Date(bookingData.checkIn),
      checkOut: bookingData.checkOut instanceof Timestamp ? bookingData.checkOut.toDate() : new Date(bookingData.checkOut),
      createdAt: bookingData.createdAt instanceof Timestamp ? bookingData.createdAt.toDate() : new Date(bookingData.createdAt),
    };
    
    // Konvertiere Timestamps auch im Hotel-Objekt
     const hotelCreatedAt = hotelData.createdAt instanceof Timestamp 
        ? hotelData.createdAt.toDate() 
        : new Date(hotelData.createdAt);

    const hotel: Hotel = {
        id: hotelSnap.id,
        ...hotelData,
        createdAt: hotelCreatedAt.toISOString(),
    } as Hotel;

    
    // Rekonstruiere das vollständige Objekt zur Übergabe an die Komponenten
    return { 
        id: linkSnap.id, 
        booking,
        hotel,
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

  // Wenn die Buchung nicht mehr 'Pending' ist, wurde sie bereits bearbeitet.
  // Leite den Benutzer direkt zur Danke-Seite weiter.
  if (linkData.booking.status !== 'Pending') {
    redirect(`/guest/${params.linkId}/thank-you`);
  }

  // Wenn der Status 'Pending' ist, zeige dem Gast den Wizard
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
