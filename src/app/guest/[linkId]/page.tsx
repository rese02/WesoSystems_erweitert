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

    // Zuerst prüfen, ob der Link selbst gültig und nicht verwendet ist
    if (!linkSnap.exists()) {
        return null;
    }
    
    const data = linkSnap.data();
    
    // Prüfen, ob der Link bereits als "used" markiert ist
    if (data.status === 'used') {
        const hotelId = data.booking?.hotelId;
        if(hotelId){
            const hotelRef = doc(db, 'hotels', hotelId);
            const hotelSnap = await getDoc(hotelRef);
            if(hotelSnap.exists()){
                 // Rekonstruiere nur genug Daten, um die "schon bearbeitet"-Seite anzuzeigen
                 return {
                    id: linkSnap.id,
                    booking: { status: 'Data Provided' } as Booking,
                    hotel: hotelSnap.data() as Hotel,
                 }
            }
        }
        // Fallback, wenn keine Hotel-Daten gefunden werden
        return {
            id: linkSnap.id,
            booking: { status: 'Data Provided' } as Booking,
            hotel: {} as Hotel,
        }
    }
    
    const bookingData = data.booking;

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
      checkIn: bookingData.checkIn.toDate(),
      checkOut: bookingData.checkOut.toDate(),
      createdAt: bookingData.createdAt.toDate(),
    };
    
    const hotel: Hotel = {
        id: hotelSnap.id,
        ...hotelData,
        createdAt: hotelData.createdAt.toDate().toISOString(),
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

  // Wenn der Link ungültig oder die Daten inkonsistent sind, zeige eine 404-Seite
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
