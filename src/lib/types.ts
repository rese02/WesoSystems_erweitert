export type Hotel = {
  id: string;
  hotelName: string;
  domain: string;
  logoUrl?: string; // Optional, da nicht immer ein Logo hochgeladen wird
  createdAt: any; // Firestore Timestamp

  // NEU: Die E-Mail für den Hotelier-Login
  hotelier: {
    email: string;
    // Wichtig: Das Passwort wird NICHT hier gespeichert. Es lebt nur in Firebase Auth.
  };

  // NEU: Öffentliche Kontaktdaten
  contact: {
    email: string;
    phone: string;
  };

  // NEU: Bankverbindung für die Gäste
  bankDetails: {
    accountHolder: string;
    iban: string;
    bic: string;
    bankName: string;
  };

  // NEU: SMTP-Einstellungen für den E-Mail-Versand
  smtp: {
    host: string;
    port: number;
    user: string;
    appPass: string; // Wichtig: App-Passwort, nicht das normale E-Mail-Passwort
  };

  // NEU: Die Buchungskonfiguration
  bookingConfig: {
    mealTypes: string[]; // z.B. ['Frühstück', 'Halbpension']
    roomCategories: string[]; // z.B. ['Einzelzimmer', 'Suite']
  };
};


export type Booking = {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: 'Sent' | 'Partial Payment' | 'Confirmed' | 'Cancelled';
  price: number;
};
