export type Hotel = {
  id: string;
  hotelName: string;
  domain: string;
  createdAt: string;
  ownerUid: string;
};

export type Booking = {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: 'Sent' | 'Partial Payment' | 'Confirmed' | 'Cancelled';
  price: number;
};
