import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, BedDouble, Euro, Users } from 'lucide-react';
import { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

type BookingSummaryCardProps = {
    booking: Booking;
};

const formatDate = (timestamp: Timestamp | Date) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'dd.MM.yy', { locale: de });
};

export function BookingSummaryCard({ booking }: BookingSummaryCardProps) {
  const totalAdults = booking.rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = booking.rooms.reduce((sum, room) => sum + room.children, 0);

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline">Ihre Buchung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Zeitraum</span>
          </div>
          <span className="font-medium">
            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
          </span>
        </div>
        <Separator />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BedDouble className="h-4 w-4" />
            <span>Zimmer</span>
          </div>
          <div className="text-right font-medium">
            {booking.rooms.map((room, index) => (
              <p key={index}>1x {room.type}</p>
            ))}
          </div>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Gäste</span>
          </div>
          <div className="text-right font-medium">
            <p>{totalAdults} Erwachsene</p>
            {totalChildren > 0 && <p>{totalChildren} Kind(er)</p>}
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Euro className="h-5 w-5" />
            <span>Gesamtpreis</span>
          </div>
          <span className="font-bold">
             {new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
              }).format(booking.price)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
