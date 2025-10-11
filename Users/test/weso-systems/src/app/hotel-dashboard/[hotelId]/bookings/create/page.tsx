
import { CreateBookingClientPage } from './create-booking-client-page';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Hotel } from '@/lib/types';

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


export default async function CreateBookingPage({ params }: { params: { hotelId: string } }) {
  const hotelConfig = await getHotelConfig(params.hotelId);
  
  return <CreateBookingClientPage hotelId={params.hotelId} config={hotelConfig} />;
}
