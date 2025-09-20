import { BookingSummaryCard } from '@/components/guest/booking-summary-card';
import { BookingWizard } from '@/components/guest/booking-wizard';
import { db } from '@/lib/firebase/client';
import { GuestLinkData, Hotel, Booking } from '@/lib/types';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';


async function getBookingLinkData(linkId: string): Promise<GuestLinkData | null> {
    const linkRef = doc(db, 'bookingLinks', linkId);
    const linkSnap = await getDoc(linkRef);

    if (!linkSnap.exists()) {
        return null; // Wird zu notFound() in der Page-Komponente
    }
    
    const linkData = linkSnap.data();
    const bookingData = linkData.booking as Booking;
     
    // Prüfen, ob der Link bereits als "used" markiert ist.
    // Wenn ja, zeige die "bereits bearbeitet" Nachricht.
    if (linkData.status === 'used') {
        return {
            id: linkSnap.id,
            booking: { // Wir benötigen einige Basis-Buchungsdaten für die Anzeige
                ...bookingData,
                status: 'Data Provided', // Simuliert den Zustand nach der Bearbeitung
                checkIn: bookingData.checkIn instanceof Timestamp ? bookingData.checkIn.toDate() : new Date(bookingData.checkIn),
                checkOut: bookingData.checkOut instanceof Timestamp ? bookingData.checkOut.toDate() : new Date(bookingData.checkOut),
                createdAt: bookingData.createdAt instanceof Timestamp ? bookingData.createdAt.toDate() : new Date(bookingData.createdAt),
            },
            hotel: {} as Hotel, // Hoteldaten sind hier nicht zwingend erforderlich
        }
    }
    
    // Wenn der Link noch aktiv ist, aber die Buchungsdaten fehlen -> Fehler
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

  // Das Gast-Formular sollte nur zugänglich sein, wenn die Buchung 'Pending' ist
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
