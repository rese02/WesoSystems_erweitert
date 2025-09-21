import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase/admin';
import { Booking, GuestData, Hotel } from '@/lib/types';
import { Timestamp } from 'firebase-admin/firestore';
import { notFound } from 'next/navigation';
import { CheckCircle, Calendar, Bed, Utensils, Users, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

type ThankYouPageProps = {
    params: { linkId: string };
};

type PageData = {
    booking: Booking;
    hotel: Hotel;
}

async function getData(linkId: string): Promise<PageData | null> {
    const linkRef = db.collection('bookingLinks').doc(linkId);
    const linkSnap = await linkRef.get();
    if (!linkSnap.exists) {
        console.error(`ThankYouPage: bookingLink ${linkId} not found.`);
        return null;
    }

    const linkData = linkSnap.data();
    if (!linkData) return null;

    const bookingDetailsInLink = linkData.booking as Booking;
    if (!bookingDetailsInLink || !bookingDetailsInLink.hotelId || !bookingDetailsInLink.id) {
         console.error(`ThankYouPage: Incomplete booking data in link ${linkId}`);
         notFound();
    }

    // KORREKTER PFAD: hotels/{hotelId}/bookings/{bookingId}
    const bookingRef = db.collection('hotels').doc(bookingDetailsInLink.hotelId).collection('bookings').doc(bookingDetailsInLink.id);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
        console.error(`ThankYouPage: Booking document not found at path: ${bookingRef.path}`);
        notFound();
    }
    const bookingData = bookingSnap.data() as Booking;

    const hotelRef = db.collection('hotels').doc(bookingData.hotelId);
    const hotelSnap = await hotelRef.get();
    if (!hotelSnap.exists) {
        console.error(`ThankYouPage: Hotel document not found at path: ${hotelRef.path}`);
        notFound();
    }

    const hotelData = hotelSnap.data() as Hotel;

    const toDate = (ts: any) => ts instanceof Timestamp ? ts.toDate() : new Date(ts);

    // WICHTIG: Füge die ID des Dokuments zum Objekt hinzu
    const booking: Booking = {
        ...bookingData,
        id: bookingSnap.id,
        hotelId: bookingData.hotelId,
        checkIn: toDate(bookingData.checkIn),
        checkOut: toDate(bookingData.checkOut),
        createdAt: toDate(bookingData.createdAt),
    };

    return { booking, hotel: hotelData };
}


const formatDate = (date: Date, fmt: string) => format(date, fmt, { locale: de });

export default async function ThankYouPage({ params }: ThankYouPageProps) {
    const data = await getData(params.linkId);
    if (!data) {
        notFound();
    }
    const { booking } = data;
    const guest = booking.guestDetails as GuestData;

    const totalGuests = booking.rooms.reduce((sum, room) => sum + (room.adults || 0) + (room.children || 0), 0);

  return (
    <div className="flex items-start justify-center p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="pt-4 font-headline text-2xl">
            Informationen übermittelt!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-muted-foreground">
             <p>Vielen Dank, {guest?.firstName || 'Gast'}!</p>
             <p>Ihre Informationen für diese Buchung wurden vollständig an uns gesendet.
             Sie erhalten in Kürze eine Bestätigungs-E-Mail.</p>
          </div>

          <Card className='text-left'>
            <CardHeader>
                <CardTitle className='text-xl'>Ihre Buchungsübersicht</CardTitle>
            </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Buchungsnummer</span>
                    <span className="font-mono text-sm font-bold">{booking.id ? booking.id.substring(0, 8).toUpperCase() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground"><Calendar className='w-4 h-4' /> Anreise</span>
                    <span className="font-medium">{formatDate(booking.checkIn as Date, "eeee, dd. MMM yyyy")}</span>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground"><Calendar className='w-4 h-4' /> Abreise</span>
                    <span className="font-medium">{formatDate(booking.checkOut as Date, "eeee, dd. MMM yyyy")}</span>
                </div>
                 {booking.rooms.map((room, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground"><Bed className='w-4 h-4' /> Zimmer {index + 1}</span>
                        <span className="font-medium">{room.type}</span>
                    </div>
                ))}
                 <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground"><Utensils className='w-4 h-4' /> Verpflegung</span>
                    <span className="font-medium">{booking.mealType}</span>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground"><Users className='w-4 h-4' /> Personen</span>
                    <span className="font-medium">{totalGuests} Pers.</span>
                </div>
                 <div className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2 font-bold"><Euro className='w-5 h-5' /> Gesamtpreis</span>
                    <span className="font-bold">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.price)}</span>
                </div>
             </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground pt-4">Sollten Sie nachträglich Änderungen wünschen oder Fragen haben, kontaktieren Sie uns bitte direkt.</p>
        </CardContent>
      </Card>
    </div>
  );
}
