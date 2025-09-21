import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase/client';
import { Booking, GuestData, Hotel } from '@/lib/types';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
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

async function getData(linkId: string): Promise<PageData> {
    const linkRef = doc(db, 'bookingLinks', linkId);
    const linkSnap = await getDoc(linkRef);
    if (!linkSnap.exists()) notFound();

    const bookingData = linkSnap.data()?.booking as Booking;
    if (!bookingData) notFound();

    const hotelRef = doc(db, 'hotels', bookingData.hotelId);
    const hotelSnap = await getDoc(hotelRef);
    if (!hotelSnap.exists()) notFound();

    const hotelData = hotelSnap.data() as Hotel;

    // Make sure all timestamps are converted to dates
    const toDate = (ts: any) => ts instanceof Timestamp ? ts.toDate() : new Date(ts);

    const booking: Booking = {
        ...bookingData,
        checkIn: toDate(bookingData.checkIn),
        checkOut: toDate(bookingData.checkOut),
        createdAt: toDate(bookingData.createdAt),
    };

    return { booking, hotel: hotelData };
}

const formatDate = (date: Date, fmt: string) => format(date, fmt, { locale: de });

export default async function ThankYouPage({ params }: ThankYouPageProps) {
    const { booking } = await getData(params.linkId);
    const guest = booking.guestDetails as GuestData;

    const totalGuests = booking.rooms.reduce((sum, room) => sum + room.adults + room.children, 0);

  return (
    <div className="flex items-start justify-center">
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
             Sie haben bereits eine Bestätigungs-E-Mail erhalten oder erhalten diese in Kürze.</p>
          </div>

          <Card className='text-left'>
            <CardHeader>
                <CardTitle className='text-xl'>Ihre Buchungsübersicht</CardTitle>
            </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Buchungsnummer</span>
                    <span className="font-mono text-sm font-bold">{booking.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground"><Calendar className='w-4 h-4' /> Anreise</span>
                    <span className="font-medium">{formatDate(booking.checkIn as Date, "eeee, dd. MMM yyyy 'ab' HH:mm 'Uhr'")}</span>
                </div>
                 <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground"><Calendar className='w-4 h-4' /> Abreise</span>
                    <span className="font-medium">{formatDate(booking.checkOut as Date, "eeee, dd. MMM yyyy 'bis' HH:mm 'Uhr'")}</span>
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
                    <span className="font-medium">{totalGuests} Erw.</span>
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
