import { Hotel, Booking } from './types';

export const mockHotels: Hotel[] = [
  {
    id: 'hetzis',
    hotelName: 'Hotel Hatzis',
    domain: 'hatzis.com',
    createdAt: '2023-10-27',
    ownerUid: 'poLnJR...',
  },
  {
    id: 'alpine-lodge',
    hotelName: 'Alpine Lodge',
    domain: 'alpinelodge.ch',
    createdAt: '2023-11-15',
    ownerUid: 'qweRTY...',
  },
  {
    id: 'seaside-resort',
    hotelName: 'Seaside Resort',
    domain: 'seaside.es',
    createdAt: '2024-01-20',
    ownerUid: 'asdFGH...',
  },
  {
    id: 'mountain-view',
    hotelName: 'Mountain View Inn',
    domain: 'mountainview.com',
    createdAt: '2024-02-10',
    ownerUid: 'zxcVBN...',
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-001',
    guestName: 'Max Mustermann',
    checkIn: '2024-08-01',
    checkOut: '2024-08-07',
    status: 'Confirmed',
    price: 1200,
  },
  {
    id: 'booking-002',
    guestName: 'Erika Mustermann',
    checkIn: '2024-08-05',
    checkOut: '2024-08-10',
    status: 'Partial Payment',
    price: 850,
  },
  {
    id: 'booking-003',
    guestName: 'John Doe',
    checkIn: '2024-09-01',
    checkOut: '2024-09-05',
    status: 'Sent',
    price: 600,
  },
  {
    id: 'booking-004',
    guestName: 'Jane Smith',
    checkIn: '2024-07-20',
    checkOut: '2024-07-25',
    status: 'Cancelled',
    price: 950,
  },
];
