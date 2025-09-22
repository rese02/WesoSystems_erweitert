import { Timestamp } from 'firebase/firestore';

export type Hotel = {
  id: string;
  hotelName: string;
  domain: string;
  logoUrl?: string; 
  createdAt: string; 

  hotelier: {
    email: string;
    uid: string; // Firebase Auth User ID
    password?: string; // Passwort wird nicht mehr in Firestore gespeichert, nur für Typ-Kompatibilität beibehalten
  };

  contact: {
    email: string;
    phone: string;
  };

  bankDetails: {
    accountHolder: string;
    iban: string;
    bic: string;
    bankName: string;
  };

  smtp: {
    host: string;
    port: number;
    user: string;
    appPass: string; 
  };

  bookingConfig: {
    mealTypes: string[]; 
    roomCategories: string[];
  };

  permissions: {
    canEditBankDetails: boolean;
  };
};

export type BookingStatus =
  | 'Pending'
  | 'Data Provided'
  | 'Partial Payment'
  | 'Confirmed'
  | 'Cancelled'
  | 'Completed';

export type Room = {
  type: string;
  adults: number;
  children: number;
  infants: number;
};

export type IdUploadRequirement = 'required' | 'choice' | 'none';

export type Booking = {
  id: string; 
  hotelId: string;
  guestName: string; 
  checkIn: Date | Timestamp; 
  checkOut: Date | Timestamp; 
  status: BookingStatus;
  price: number;
  mealType: string;
  language: 'de' | 'en' | 'it';
  rooms: Room[];
  internalNotes?: string;
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  guestDetails?: GuestData;
  paymentOption?: 'deposit' | 'full';
  amountPaid?: number;
  idUploadRequirement: IdUploadRequirement;
};

export type FellowTravelerData = {
  name: string;
  idFrontUrl: string;
  idBackUrl: string;
};


export type GuestData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  street: string;
  zip: string;
  city: string;
  fellowTravelers: FellowTravelerData[];
  specialRequests?: string;
  documentUrls: {
    idFront: string;
    idBack: string;
    paymentProof: string;
  }
};

export type GuestLinkData = {
  id: string; 
  booking: Booking;
  hotel: Hotel;
};