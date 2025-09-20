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
import { de, enUS, it } from 'date-fns/locale';
import { Booking, Hotel } from '@/lib/types';
import * as React from 'react';

const locales = {
  de: de,
  en: enUS,
  it: it,
};

const t = (lang: 'de' | 'en' | 'it', key: string): string => {
  const translations = {
    de: {
      title: "Ihre Buchungsbestätigung",
      hotel: "Hotel",
      dear: "Sehr geehrte/r",
      intro: "vielen Dank für Ihre Buchung bei uns. Wir freuen uns, Sie bald begrüßen zu dürfen!",
      details: "Details Ihrer Buchung",
      bookingNumber: "Buchungsnummer",
      name: "Name",
      checkIn: "Anreise",
      checkOut: "Abreise",
      checkInTime: "ab",
      checkOutTime: "bis",
      timeSuffix: "Uhr",
      room: "Zimmer",
      guests: "Gäste",
      adults: "Erwachsene",
      children: "Kinder",
      meal: "Verpflegung",
      payment: "Zahlungsinformationen",
      totalPrice: "Gesamtpreis",
      balance: "Saldo",
      balancePaid: "Vollständig bezahlt",
      importantInfo: "Wichtige Informationen",
      infoText1: "Bitte halten Sie diese Bestätigung beim Check-in bereit.",
      infoText2: "Für Fragen stehen wir Ihnen gerne zur Verfügung:",
      phone: "Telefon",
      email: "E-Mail",
      outro: "Wir wünschen Ihnen eine angenehme Anreise und freuen uns auf Ihren Besuch.",
      regards: "Herzliche Grüße,",
      team: "Das Team vom",
      contact: "Kontakt",
      preview: "Buchungsbestätigung für"
    },
    en: {
      title: "Your Booking Confirmation",
      hotel: "Hotel",
      dear: "Dear",
      intro: "thank you for your booking with us. We look forward to welcoming you soon!",
      details: "Your Booking Details",
      bookingNumber: "Booking Number",
      name: "Name",
      checkIn: "Arrival",
      checkOut: "Departure",
      checkInTime: "from",
      checkOutTime: "until",
      timeSuffix: "",
      room: "Room",
      guests: "Guests",
      adults: "Adults",
      children: "Children",
      meal: "Board",
      payment: "Payment Information",
      totalPrice: "Total Price",
      balance: "Balance",
      balancePaid: "Paid in full",
      importantInfo: "Important Information",
      infoText1: "Please have this confirmation ready at check-in.",
      infoText2: "If you have any questions, we are at your disposal:",
      phone: "Phone",
      email: "Email",
      outro: "We wish you a pleasant journey and look forward to your visit.",
      regards: "Kind regards,",
      team: "The team at",
      contact: "Contact",
      preview: "Booking confirmation for"
    },
    it: {
      title: "La Sua Conferma di Prenotazione",
      hotel: "Hotel",
      dear: "Gentile",
      intro: "grazie per aver prenotato con noi. Non vediamo l'ora di darLe il benvenuto!",
      details: "Dettagli della Sua Prenotazione",
      bookingNumber: "Numero di Prenotazione",
      name: "Nome",
      checkIn: "Arrivo",
      checkOut: "Partenza",
      checkInTime: "dalle",
      checkOutTime: "fino alle",
      timeSuffix: "",
      room: "Camera",
      guests: "Ospiti",
      adults: "Adulti",
      children: "Bambini",
      meal: "Pensione",
      payment: "Informazioni sul Pagamento",
      totalPrice: "Prezzo Totale",
      balance: "Saldo",
      balancePaid: "Interamente pagato",
      importantInfo: "Informazioni Importanti",
      infoText1: "Si prega di tenere questa conferma pronta al check-in.",
      infoText2: "Per qualsiasi domanda, siamo a Sua completa disposizione:",
      phone: "Telefono",
      email: "E-mail",
      outro: "Le auguriamo un buon viaggio e attendiamo con piacere la Sua visita.",
      regards: "Cordiali saluti,",
      team: "Il team dell'Hotel",
      contact: "Contatto",
      preview: "Conferma di prenotazione per"
    },
  };
  return translations[lang][key] || key;
};

interface BookingConfirmationEmailProps {
  booking: Booking;
  hotel: Hotel;
}

export const BookingConfirmationEmail = ({
  booking,
  hotel,
}: BookingConfirmationEmailProps) => {

  const lang = booking.language || 'de';
  const T = (key: string) => t(lang, key);
  const locale = locales[lang];

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate();
    return format(d, 'EEEE, dd. MMMM yyyy', { locale });
  };
  const formatTime = (date: any) => {
      if (!date) return '';
      const d = date instanceof Date ? date : date.toDate();
      return format(d, 'HH:mm', { locale });
  }

  const totalAdults = booking.rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = booking.rooms.reduce((sum, room) => sum + room.children, 0);
  const guestName = booking.guestDetails?.firstName ? `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}` : booking.guestName;
  const previewText = `${T('preview')} ${hotel.hotelName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 p-8 rounded-lg shadow-md max-w-2xl">
            
            <Section className="bg-green-100 p-8 rounded-t-lg text-center">
              <Heading className="text-2xl font-bold text-gray-800 m-0">
                {T('title')}
              </Heading>
              <Text className="text-gray-700 text-lg m-0 pt-2">{hotel.hotelName}</Text>
            </Section>

            <Section className="p-8">
              <Text className="text-base">
                {T('dear')} {guestName},
              </Text>
              <Text className="text-base">
                {T('intro')}
              </Text>
              
              <Hr className="border-gray-300 my-6" />

              <Heading as="h2" className="text-xl font-semibold text-gray-700">
                {T('details')}
              </Heading>

              <Section className="mt-4 text-base">
                <p><strong>{T('bookingNumber')}:</strong> {booking.id.substring(0, 8).toUpperCase()}</p>
                <p><strong>{T('name')}:</strong> {guestName}</p>
                <p><strong>{T('checkIn')}:</strong> {formatDate(booking.checkIn)} ({T('checkInTime')} {formatTime(booking.checkIn)} {T('timeSuffix')})</p>
                <p><strong>{T('checkOut')}:</strong> {formatDate(booking.checkOut)} ({T('checkOutTime')} {formatTime(booking.checkOut)} {T('timeSuffix')})</p>
                <p><strong>{T('room')}:</strong> {booking.rooms.map(r => r.type).join(', ')}</p>
                <p><strong>{T('guests')}:</strong> {totalAdults} {T('adults')}, {totalChildren} {T('children')}</p>
                <p><strong>{T('meal')}:</strong> {booking.mealType}</p>
              </Section>
              
              <Hr className="border-gray-300 my-6" />

              <Heading as="h2" className="text-xl font-semibold text-gray-700">
                {T('payment')}
              </Heading>
              <Section className="mt-4 text-base">
                 <p><strong>{T('totalPrice')}:</strong> {new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(booking.price)}</p>
                 <p className="text-green-600 font-semibold">{T('balance')}: 0,00 € ({T('balancePaid')})</p>
              </Section>

              <Section className="mt-8 bg-gray-50 p-6 rounded-lg">
                <Heading as="h3" className="text-lg font-semibold text-gray-800">
                    {T('importantInfo')}
                </Heading>
                <Text className="text-sm">{T('infoText1')}</Text>
                <Text className="text-sm">{T('infoText2')}</Text>
                <Text className="text-sm">{T('phone')}: {hotel.contact.phone}</Text>
                <Text className="text-sm">{T('email')}: {hotel.contact.email}</Text>
              </Section>

              <Text className="mt-8 text-base">
                {T('outro')}
              </Text>
              <Text className="text-base">
                {T('regards')}
                <br />
                {T('team')} {hotel.hotelName}
              </Text>
            </Section>

            <Hr className="border-gray-300" />

            <Section className="text-center text-xs text-gray-500 pt-4">
               <p>{hotel.hotelName} | {hotel.domain}</p>
               <p>{T('contact')}: {hotel.contact.email}</p>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BookingConfirmationEmail;
