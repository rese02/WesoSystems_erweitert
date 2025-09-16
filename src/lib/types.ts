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

export type BookingStatus =
  | 'Pending'
  | 'Sent'
  | 'Data Provided'
  | 'Partial Payment'
  | 'Confirmed'
  | 'Cancelled';

export type Room = {
  type: string;
  adults: number;
  children: number;
};

export type Booking = {
  id: string; // Document ID in Firestore
  hotelId: string;
  guestName: string; // Vor- und Nachname des Hauptgastes
  checkIn: string; // ISO Date String
  checkOut: string; // ISO Date String
  status: BookingStatus;
  price: number;
  mealType: string;
  language: string;
  rooms: Room[];
  internalNotes?: string;
  createdAt: any; // Firestore Timestamp
};

export type GuestData = {
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  zip: string;
  city: string;
  fellowTravelers: { name: string }[];
  specialRequests?: string;
};

export type GuestLinkData = {
  id: string; // Document ID in Firestore, der `linkId`
  booking: Booking;
};
