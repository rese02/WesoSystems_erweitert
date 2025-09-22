import { CreateBookingClientPage } from '../../create/create-booking-client-page';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Hotel, Booking } from '@/lib/types';

async function getHotelConfig(hotelId: string) {
    const hotelRef = doc(db, 'hotels', hotelId);
    const hotelSnap = await getDoc(hotelRef);

    if (!hotelSnap.exists()) {
        notFound();
    }
    
    const hotelData = hotelSnap.data() as Hotel;

    return {
        roomCategories: hotelData.bookingConfig?.roomCategories || ['Standard'],
        mealTypes: hotelData.bookingConfig?.mealTypes || ['Keine'],
    };
}

async function getBooking(hotelId: string, bookingId: string): Promise<Booking> {
  const bookingRef = doc(db, 'hotels', hotelId, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);

  if (!bookingSnap.exists()) {
    notFound();
  }
  
  const data = bookingSnap.data();

  // Convert Timestamps to serializable Dates for the client component.
  // This prevents hydration errors.
  return { 
      ...data, 
      id: bookingSnap.id,
      hotelId: hotelId,
      checkIn: data.checkIn?.toDate(),
      checkOut: data.checkOut?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
  } as Booking;
}


export default async function EditBookingPage({ params }: { params: { hotelId: string, bookingId: string } }) {
  const hotelConfig = await getHotelConfig(params.hotelId);
  const bookingData = await getBooking(params.hotelId, params.bookingId);
  
  return <CreateBookingClientPage hotelId={params.hotelId} config={hotelConfig} booking={bookingData} />;
}
