import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, BedDouble, Euro, Users } from 'lucide-react';
import { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { de, enUS, it } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

const locales = {
  de: de,
  en: enUS,
  it: it,
};

const t = (lang: 'de' | 'en' | 'it', key: string): string => {
  const translations = {
    de: {
      title: "Ihre Buchung",
      period: "Zeitraum",
      room: "Zimmer",
      guests: "Gäste",
      total: "Gesamtpreis",
      adults: "Erwachsene",
      children: "Kind(er)",
    },
    en: {
        title: "Your Booking",
        period: "Period",
        room: "Room",
        guests: "Guests",
        total: "Total Price",
        adults: "Adults",
        children: "Child(ren)",
    },
    it: {
        title: "La Sua Prenotazione",
        period: "Periodo",
        room: "Camera",
        guests: "Ospiti",
        total: "Prezzo Totale",
        adults: "Adulti",
        children: "Bambino/i",
    },
  };
  return translations[lang][key] || key;
};


type BookingSummaryCardProps = {
    booking: Booking;
};

export function BookingSummaryCard({ booking }: BookingSummaryCardProps) {
  const lang = booking.language || 'de';
  const T = (key: string) => t(lang, key);
  const locale = locales[lang];

  const formatDate = (timestamp: Timestamp | Date) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return format(date, 'dd.MM.yy', { locale });
  };

  const totalAdults = booking.rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = booking.rooms.reduce((sum, room) => sum + room.children, 0);

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline">{T('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{T('period')}</span>
          </div>
          <span className="font-medium">
            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
          </span>
        </div>
        <Separator />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BedDouble className="h-4 w-4" />
            <span>{T('room')}</span>
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
            <span>{T('guests')}</span>
          </div>
          <div className="text-right font-medium">
            <p>{totalAdults} {T('adults')}</p>
            {totalChildren > 0 && <p>{totalChildren} {T('children')}</p>}
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Euro className="h-5 w-5" />
            <span>{T('total')}</span>
          </div>
          <span className="font-bold">
             {new Intl.NumberFormat(lang, {
                style: 'currency',
                currency: 'EUR',
              }).format(booking.price)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
