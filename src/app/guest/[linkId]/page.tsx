import { BookingSummaryCard } from '@/components/guest/booking-summary-card';
import { BookingWizard } from '@/components/guest/booking-wizard';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase/client';
import { GuestLinkData, Hotel, Booking } from '@/lib/types';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

async function getBookingLinkData(linkId: string): Promise<GuestLinkData | null> {
    const linkRef = doc(db, 'bookingLinks', linkId);
    const linkSnap = await getDoc(linkRef);

    if (!linkSnap.exists()) {
        return null; // Wird zu notFound() in der Page-Komponente
    }
    
    const linkData = linkSnap.data();
    
    // Wenn der Link genutzt wurde, zeige eine spezifische Meldung oder leite um.
    if (linkData.status === 'used') {
        return {
            id: linkSnap.id,
            booking: { status: 'Completed' } as Booking,
            hotel: {} as Hotel,
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

  // NEU: Die Sperre
  // Wenn die Buchung bereits abgeschlossen ist (der Link also 'used' ist), zeige eine Meldung.
  if (linkData.booking.status === 'Completed') {
    return (
        <div className="text-center p-10 flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold">Dieser Buchungslink wurde bereits verwendet.</h1>
            <p className="text-muted-foreground mt-2">Ihre Daten wurden bereits erfolgreich übermittelt.</p>
             <Button asChild variant="link" className="mt-4">
              <Link href="/">Zur Startseite</Link>
            </Button>
        </div>
    );
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
