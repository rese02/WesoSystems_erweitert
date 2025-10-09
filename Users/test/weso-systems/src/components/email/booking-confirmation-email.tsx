import { format } from 'date-fns';
import { de, en, it } from 'date-fns/locale';
import { Booking, Hotel } from '@/lib/types';

const locales = {
  de: de,
  en: en,
  it: it,
};

const t = (lang: 'de' | 'en' | 'it', key: string): string => {
  const translations = {
    de: {
      title: "Ihre Buchungsbestätigung",
      hotel: "Hotel",
      dear: "Sehr geehrte/r",
      intro: "vielen Dank für Ihre Buchung bei uns. Ihre Daten wurden erfolgreich übermittelt und wir freuen uns, Sie bald begrüßen zu dürfen!",
      details: "Details Ihrer Buchung",
      bookingNumber: "Buchungsnummer",
      name: "Name",
      checkIn: "Anreise",
      checkOut: "Abreise",
      checkInTime: "ab 15:00 Uhr",
      checkOutTime: "bis 11:00 Uhr",
      room: "Zimmer",
      guests: "Gäste",
      adults: "Erwachsene",
      children: "Kinder",
      meal: "Verpflegung",
      payment: "Zahlungsinformationen",
      totalPrice: "Gesamtpreis",
      amountPaid: "Geleistete Zahlung",
      balance: "Offener Betrag",
      importantInfo: "Wichtige Informationen",
      infoText1: "Dies ist eine Bestätigung, dass wir Ihre Daten erhalten haben. Eine separate Zahlungsbestätigung folgt gegebenenfalls.",
      infoText2: "Für Fragen stehen wir Ihnen gerne zur Verfügung:",
      phone: "Telefon",
      email: "E-Mail",
      outro: "Wir wünschen Ihnen eine angenehme Anreise und freuen uns auf Ihren Besuch.",
      regards: "Herzliche Grüße,",
      team: "Das Team vom",
      contact: "Kontakt",
      // Meal Types
      'Frühstück': 'Frühstück',
      'Halbpension': 'Halbpension',
      'Vollpension': 'Vollpension',
      'Ohne Verpflegung': 'Ohne Verpflegung',
    },
    en: {
      title: "Your Booking Confirmation",
      hotel: "Hotel",
      dear: "Dear",
      intro: "thank you for your booking with us. Your data has been successfully submitted and we look forward to welcoming you soon!",
      details: "Your Booking Details",
      bookingNumber: "Booking Number",
      name: "Name",
      checkIn: "Arrival",
      checkOut: "Departure",
      checkInTime: "from 3:00 PM",
      checkOutTime: "until 11:00 AM",
      room: "Room",
      guests: "Guests",
      adults: "Adults",
      children: "Children",
      meal: "Board",
      payment: "Payment Information",
      totalPrice: "Total Price",
      amountPaid: "Amount Paid",
      balance: "Balance Due",
      importantInfo: "Important Information",
      infoText1: "This is a confirmation that we have received your data. A separate payment confirmation may follow.",
      infoText2: "If you have any questions, we are at your disposal:",
      phone: "Phone",
      email: "Email",
      outro: "We wish you a pleasant journey and look forward to your visit.",
      regards: "Kind regards,",
      team: "The team at",
      contact: "Contact",
      // Meal Types
      'Frühstück': 'Breakfast',
      'Halbpension': 'Half Board',
      'Vollpension': 'Full Board',
      'Ohne Verpflegung': 'No Meal Plan',
    },
    it: {
      title: "La Sua Conferma di Prenotazione",
      hotel: "Hotel",
      dear: "Gentile",
      intro: "grazie per aver prenotato con noi. I Suoi dati sono stati inviati con successo e non vediamo l'ora di darLe il benvenuto!",
      details: "Dettagli della Sua Prenotazione",
      bookingNumber: "Numero di Prenotazione",
      name: "Nome",
      checkIn: "Arrivo",
      checkOut: "Partenza",
      checkInTime: "dalle 15:00",
      checkOutTime: "fino alle 11:00",
      room: "Camera",
      guests: "Ospiti",
      adults: "Adulti",
      children: "Bambini",
      meal: "Pensione",
      payment: "Informazioni sul Pagamento",
      totalPrice: "Prezzo Totale",
      amountPaid: "Importo Pagato",
      balance: "Saldo Residuo",
      importantInfo: "Informazioni Importanti",
      infoText1: "Questa è una conferma che abbiamo ricevuto i Suoi dati. Potrebbe seguire una conferma di pagamento separata.",
      infoText2: "Per qualsiasi domanda, siamo a Sua completa disposizione:",
      phone: "Telefono",
      email: "E-mail",
      outro: "Le auguriamo un buon viaggio e attendiamo con piacere la Sua visita.",
      regards: "Cordiali saluti,",
      team: "Il team dell'Hotel",
      contact: "Contatto",
      // Meal Types
      'Frühstück': 'Colazione',
      'Halbpension': 'Mezza Pensione',
      'Vollpension': 'Pensione Completa',
      'Ohne Verpflegung': 'Senza Vitto',
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
  
  const totalAdults = booking.rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = booking.rooms.reduce((sum, room) => sum + room.children, 0);
  const guestName = booking.guestDetails?.firstName ? `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}` : booking.guestName;
  const roomsText = booking.rooms.map(r => r.type).join(', ');

  const formatCurrency = (amount: number) => new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amount);

  const amountPaid = booking.amountPaid || 0;
  const amountDue = booking.price - amountPaid;

  const translatedMealType = T(booking.mealType);


  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f4f4f7; margin: 0; padding: 20px; color: #333; }
            .container { background-color: #ffffff; margin: 0 auto; padding: 40px; border-radius: 12px; max-width: 600px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
            .header { text-align: center; border-bottom: 1px solid #e9e9e9; padding-bottom: 20px; margin-bottom: 30px; }
            .header img { max-height: 60px; margin-bottom: 15px; }
            .header h1 { font-size: 26px; color: #333; margin: 0; font-weight: 700; }
            .content { padding: 0; }
            .content p { line-height: 1.7; margin: 0 0 15px; }
            .content h2 { font-size: 20px; color: #333; border-bottom: 2px solid #e9e9e9; padding-bottom: 8px; margin-top: 40px; margin-bottom: 20px; font-weight: 600; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px; margin-top: 20px; padding: 20px; background-color: #f9f9fc; border-radius: 8px; }
            .details-grid p { margin: 0; font-size: 15px; }
            .details-grid strong { color: #555; display: block; margin-bottom: 4px; font-size: 13px; font-weight: 500; }
            .total-price { font-size: 24px; font-weight: bold; color: #1a1a1a; text-align: right; margin-top: 20px; }
            .info-box { margin-top: 30px; background-color: #f9f9fc; padding: 20px; border-radius: 8px; }
            .info-box h3 { font-size: 16px; margin: 0 0 10px; font-weight: 600; }
            .footer { text-align: center; font-size: 13px; color: #888; padding-top: 30px; margin-top: 30px; border-top: 1px solid #e9e9e9; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                ${hotel.logoUrl ? `<img src="${hotel.logoUrl}" alt="${hotel.hotelName}">` : ''}
                <h1>${T('title')}</h1>
            </div>
            <div class="content">
                <p><strong>${T('dear')} ${guestName},</strong></p>
                <p>${T('intro')}</p>

                <h2>${T('details')}</h2>
                <div class="details-grid">
                    <div>
                        <strong>${T('bookingNumber')}</strong>
                        <p>${booking.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                     <div>
                        <strong>${T('name')}</strong>
                        <p>${guestName}</p>
                    </div>
                    <div>
                        <strong>${T('checkIn')}</strong>
                        <p>${formatDate(booking.checkIn)} (${T('checkInTime')})</p>
                    </div>
                    <div>
                        <strong>${T('checkOut')}</strong>
                        <p>${formatDate(booking.checkOut)} (${T('checkOutTime')})</p>
                    </div>
                    <div>
                        <strong>${T('room')}</strong>
                        <p>${roomsText}</p>
                    </div>
                     <div>
                        <strong>${T('guests')}</strong>
                        <p>${totalAdults} ${T('adults')}, ${totalChildren} ${T('children')}</p>
                    </div>
                     <div>
                        <strong>${T('meal')}</strong>
                        <p>${translatedMealType}</p>
                    </div>
                </div>

                <h2>${T('payment')}</h2>
                <div class="details-grid">
                    <div>
                       <strong>${T('totalPrice')}</strong>
                       <p style="font-size: 18px; font-weight: 600;">${formatCurrency(booking.price)}</p>
                    </div>
                     <div>
                       <strong>${T('amountPaid')}</strong>
                       <p>${formatCurrency(amountPaid)}</p>
                    </div>
                    <div>
                       <strong>${T('balance')}</strong>
                       <p style="font-size: 18px; font-weight: 600; color: ${amountDue > 0 ? '#d9534f' : '#5cb85c'};">${formatCurrency(amountDue)}</p>
                    </div>
                </div>

                <div class="info-box">
                    <h3>${T('importantInfo')}</h3>
                    <p>${T('infoText1')}</p>
                    <p>${T('infoText2')}</p>
                    <p><strong>${T('phone')}:</strong> ${hotel.contact.phone}</p>
                    <p><strong>${T('email')}:</strong> ${hotel.contact.email}</p>
                </div>

                <p style="margin-top: 30px;">${T('outro')}</p>
                <p>
                    ${T('regards')}<br>
                    <strong>${T('team')} ${hotel.hotelName}</strong>
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
