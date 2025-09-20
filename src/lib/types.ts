import { Timestamp } from 'firebase/firestore';

export type Hotel = {
  id: string;
  hotelName: string;
  domain: string;
  logoUrl?: string; 
  createdAt: string | Date; 

  hotelier: {
    email: string;
    password?: string;
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
  | 'Cancelled';

export type Room = {
  type: string;
  adults: number;
  children: number;
  infants: number;
};

export type Booking = {
  id: string; 
  hotelId: string;
  guestName: string; 
  checkIn: Timestamp | Date; 
  checkOut: Timestamp | Date; 
  status: BookingStatus;
  price: number;
  mealType: string;
  language: 'de' | 'en' | 'it';
  rooms: Room[];
  internalNotes?: string;
  createdAt: Timestamp | Date; 
  guestDetails?: GuestData;
  paymentOption?: 'deposit' | 'full';
  amountPaid?: number;
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
  fellowTravelers: { name: string }[];
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
