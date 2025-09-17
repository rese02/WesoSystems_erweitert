import { Timestamp } from 'firebase/firestore';

export type Hotel = {
  id: string;
  hotelName: string;
  domain: string;
  logoUrl?: string; 
  createdAt: string; 

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
  id: string; 
  hotelId: string;
  guestName: string; 
  checkIn: Timestamp; 
  checkOut: Timestamp; 
  status: BookingStatus;
  price: number;
  mealType: string;
  language: string;
  rooms: Room[];
  internalNotes?: string;
  createdAt: Timestamp; 
  guestDetails?: GuestData;
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
  id: string; 
  booking: Booking;
  hotel: Hotel;
};
