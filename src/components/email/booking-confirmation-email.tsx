import { format } from 'date-fns';
import { de, enUS, it } from 'date-fns/locale';
import { Booking, Hotel } from '@/lib/types';

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
    },
  };
  return translations[lang][key] || key;
};

interface BookingConfirmationEmailProps {
  booking: Booking;
  hotel: Hotel;
}

export const bookingConfirmationEmailTemplate = ({
  booking,
  hotel,
}: BookingConfirmationEmailProps): string => {

  const lang = booking.language || 'de';
  const T = (key: string) => t(lang, key);
  const locale = locales[lang];

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return format(d, 'EEEE, dd. MMMM yyyy', { locale });
  };
  const formatTime = (date: any) => {
      if (!date) return '';
      const d = date instanceof Date ? date : new Date(date);
      return format(d, 'HH:mm', { locale });
  }

  const totalAdults = booking.rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = booking.rooms.reduce((sum, room) => sum + room.children, 0);
  const guestName = booking.guestDetails?.firstName ? `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}` : booking.guestName;
  const roomsText = booking.rooms.map(r => r.type).join(', ');

  const formatCurrency = (amount: number) => new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { background-color: #ffffff; margin: 40px auto; padding: 20px; border-radius: 8px; max-width: 600px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            .header { background-color: #e6f4ea; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { font-size: 24px; color: #333; margin: 0; }
            .header p { font-size: 18px; color: #555; margin: 5px 0 0; }
            .content { padding: 20px; }
            .content p { line-height: 1.6; }
            .content h2 { font-size: 20px; color: #444; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 30px; }
            .details, .payment { margin-top: 20px; }
            .details p, .payment p { margin: 10px 0; }
            .info-box { margin-top: 30px; background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
            .info-box h3 { font-size: 16px; margin: 0 0 10px; }
            .footer { text-align: center; font-size: 12px; color: #888; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${T('title')}</h1>
                <p>${hotel.hotelName}</p>
            </div>
            <div class="content">
                <p>${T('dear')} ${guestName},</p>
                <p>${T('intro')}</p>

                <h2>${T('details')}</h2>
                <div class="details">
                    <p><strong>${T('bookingNumber')}:</strong> ${booking.id.substring(0, 8).toUpperCase()}</p>
                    <p><strong>${T('name')}:</strong> ${guestName}</p>
                    <p><strong>${T('checkIn')}:</strong> ${formatDate(booking.checkIn)} (${T('checkInTime')} ${formatTime(booking.checkIn)} ${T('timeSuffix')})</p>
                    <p><strong>${T('checkOut')}:</strong> ${formatDate(booking.checkOut)} (${T('checkOutTime')} ${formatTime(booking.checkOut)} ${T('timeSuffix')})</p>
                    <p><strong>${T('room')}:</strong> ${roomsText}</p>
                    <p><strong>${T('guests')}:</strong> ${totalAdults} ${T('adults')}, ${totalChildren} ${T('children')}</p>
                    <p><strong>${T('meal')}:</strong> ${booking.mealType}</p>
                </div>

                <h2>${T('payment')}</h2>
                <div class="payment">
                    <p><strong>${T('totalPrice')}:</strong> ${formatCurrency(booking.price)}</p>
                    <p style="color: green; font-weight: bold;">${T('balance')}: 0,00 € (${T('balancePaid')})</p>
                </div>

                <div class="info-box">
                    <h3>${T('importantInfo')}</h3>
                    <p>${T('infoText1')}</p>
                    <p>${T('infoText2')}</p>
                    <p><strong>${T('phone')}:</strong> ${hotel.contact.phone}</p>
                    <p><strong>${T('email')}:</strong> ${hotel.contact.email}</p>
                </div>

                <p>${T('outro')}</p>
                <p>
                    ${T('regards')}<br>
                    ${T('team')} ${hotel.hotelName}
                </p>
            </div>
            <div class="footer">
                <p>${hotel.hotelName} | ${hotel.domain}</p>
                <p>${T('contact')}: ${hotel.contact.email}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
