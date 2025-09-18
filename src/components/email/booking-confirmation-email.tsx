import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Booking, Hotel } from '@/lib/types';
import * as React from 'react';

interface BookingConfirmationEmailProps {
  booking: Booking;
  hotel: Hotel;
}

const formatDate = (date: any) => {
    if (!date) return '';
    return format(date.toDate(), 'EEEE, dd. MMMM yyyy', { locale: de });
}
const formatTime = (date: any) => {
    if (!date) return '';
    return format(date.toDate(), 'HH:mm', { locale: de });
}


export const BookingConfirmationEmail = ({
  booking,
  hotel,
}: BookingConfirmationEmailProps) => {

  const totalAdults = booking.rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = booking.rooms.reduce((sum, room) => sum + room.children, 0);
  const guestName = booking.guestDetails?.firstName ? `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}` : booking.guestName;
  const previewText = `Buchungsbestätigung für ${hotel.hotelName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 p-8 rounded-lg shadow-md max-w-2xl">
            
            <Section className="bg-green-100 p-8 rounded-t-lg text-center">
              <Heading className="text-2xl font-bold text-gray-800 m-0">
                Ihre Buchungsbestätigung
              </Heading>
              <Text className="text-gray-700 text-lg m-0 pt-2">{hotel.hotelName}</Text>
            </Section>

            <Section className="p-8">
              <Text className="text-base">
                Sehr geehrte/r {guestName},
              </Text>
              <Text className="text-base">
                vielen Dank für Ihre Buchung bei uns. Wir freuen uns, Sie bald begrüßen zu dürfen!
              </Text>
              
              <Hr className="border-gray-300 my-6" />

              <Heading as="h2" className="text-xl font-semibold text-gray-700">
                Details Ihrer Buchung
              </Heading>

              <Section className="mt-4 text-base">
                <p><strong>Buchungsnummer:</strong> {booking.id.substring(0, 8).toUpperCase()}</p>
                <p><strong>Name:</strong> {guestName}</p>
                <p><strong>Anreise:</strong> {formatDate(booking.checkIn)} (ab {formatTime(booking.checkIn)} Uhr)</p>
                <p><strong>Abreise:</strong> {formatDate(booking.checkOut)} (bis {formatTime(booking.checkOut)} Uhr)</p>
                <p><strong>Zimmer:</strong> {booking.rooms.map(r => r.type).join(', ')}</p>
                <p><strong>Gäste:</strong> {totalAdults} Erwachsene, {totalChildren} Kinder</p>
                <p><strong>Verpflegung:</strong> {booking.mealType}</p>
              </Section>
              
              <Hr className="border-gray-300 my-6" />

              <Heading as="h2" className="text-xl font-semibold text-gray-700">
                Zahlungsinformationen
              </Heading>
              <Section className="mt-4 text-base">
                 <p><strong>Gesamtpreis:</strong> {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.price)}</p>
                 <p className="text-green-600 font-semibold">Saldo: 0,00 € (Vollständig bezahlt)</p>
              </Section>

              <Section className="mt-8 bg-gray-50 p-6 rounded-lg">
                <Heading as="h3" className="text-lg font-semibold text-gray-800">
                    Wichtige Informationen
                </Heading>
                <Text className="text-sm">Bitte halten Sie diese Bestätigung beim Check-in bereit.</Text>
                <Text className="text-sm">Für Fragen stehen wir Ihnen gerne zur Verfügung:</Text>
                <Text className="text-sm">Telefon: {hotel.contact.phone}</Text>
                <Text className="text-sm">E-Mail: {hotel.contact.email}</Text>
              </Section>

              <Text className="mt-8 text-base">
                Wir wünschen Ihnen eine angenehme Anreise und freuen uns auf Ihren Besuch.
              </Text>
              <Text className="text-base">
                Herzliche Grüße,
                <br />
                Das Team vom {hotel.hotelName}
              </Text>
            </Section>

            <Hr className="border-gray-300" />

            <Section className="text-center text-xs text-gray-500 pt-4">
               <p>{hotel.hotelName} | {hotel.domain}</p>
               <p>Kontakt: {hotel.contact.email}</p>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BookingConfirmationEmail;
