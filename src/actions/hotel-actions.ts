'use server';

import {db} from '@/lib/firebase/client';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {Booking, Room} from '@/lib/types';
import {DateRange} from 'react-day-picker';

type CreateHotelState = {
  message: string;
  success: boolean;
};

export async function createHotelAction(
  prevState: CreateHotelState,
  formData: FormData
): Promise<CreateHotelState> {
  const hotelierEmail = formData.get('hotelierEmail') as string;

  // Check if email already exists
  const hotelsRef = collection(db, 'hotels');
  const q = query(hotelsRef, where('hotelier.email', '==', hotelierEmail));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return {
      message: 'Diese E-Mail-Adresse wird bereits für ein anderes Hotel verwendet.',
      success: false,
    };
  }


  const mealTypes = formData.getAll('mealTypes') as string[];
  const roomCategories = formData.getAll('roomCategories') as string[];

  const hotelData = {
    hotelName: formData.get('hotelName') as string,
    domain: formData.get('domain') as string,
    createdAt: new Date(),

    hotelier: {
      email: hotelierEmail,
      password: formData.get('hotelierPassword') as string,
    },

    contact: {
      email: formData.get('contactEmail') as string,
      phone: formData.get('contactPhone') as string,
    },

    bankDetails: {
      accountHolder: formData.get('accountHolder') as string,
      iban: formData.get('iban') as string,
      bic: formData.get('bic') as string,
      bankName: formData.get('bankName') as string,
    },

    smtp: {
      host: formData.get('smtpHost') as string,
      port: Number(formData.get('smtpPort')),
      user: formData.get('smtpUser') as string,
      appPass: formData.get('smtpPass') as string,
    },

    bookingConfig: {
      mealTypes: mealTypes,
      roomCategories: roomCategories,
    },
  };

  try {
    const docRef = await addDoc(collection(db, 'hotels'), hotelData);
    console.log('Hotel created with ID: ', docRef.id);
  } catch (error) {
    console.error('Error creating hotel:', error);
    return {
      message: 'Hotel konnte nicht erstellt werden.',
      success: false,
    };
  }

  revalidatePath('/admin');
  redirect('/admin');
}

export async function deleteHotelAction(hotelId: string) {
  try {
    await deleteDoc(doc(db, 'hotels', hotelId));
    revalidatePath('/admin');
    return {
      message: 'Hotel erfolgreich gelöscht.',
      success: true,
    };
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return {
      message: 'Fehler beim Löschen des Hotels.',
      success: false,
    };
  }
}

export async function createBookingAction(
  hotelId: string,
  formData: FormData,
  rooms: Room[],
  date?: DateRange
) {
  if (!date?.from || !date?.to) {
    return {success: false, message: 'An- und Abreisedatum sind erforderlich.'};
  }

  const bookingData: Omit<Booking, 'id' | 'hotelId'> = {
    guestName: `${formData.get('firstName')} ${formData.get('lastName')}`,
    checkIn: Timestamp.fromDate(date.from),
    checkOut: Timestamp.fromDate(date.to),
    price: parseFloat(formData.get('price') as string),
    mealType: formData.get('mealType') as string,
    language: formData.get('language') as string,
    internalNotes: (formData.get('internalNotes') as string) || '',
    rooms: rooms,
    status: 'Pending',
    createdAt: Timestamp.now(),
  };

  try {
    const bookingCollection = collection(db, 'hotels', hotelId, 'bookings');
    const docRef = await addDoc(bookingCollection, bookingData);

    // This is the crucial part: create the full booking object to store in the link
    const fullBookingData: Booking = {
        ...bookingData,
        id: docRef.id, // The ID of the booking document itself
        hotelId: hotelId,
    }

    // Now, create the booking link document with ALL the necessary data
    const linkRef = await addDoc(collection(db, 'bookingLinks'), {
      hotelId: hotelId,
      bookingId: docRef.id,
      createdAt: Timestamp.now(),
      status: 'active', // 'active' means the link can be used
      booking: fullBookingData // Embed the full booking data
    });

    revalidatePath(`/dashboard/${hotelId}/bookings`);

    // Use NEXT_PUBLIC_APP_URL for the domain to ensure it works in all environments
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const bookingLink = `${domain}/guest/${linkRef.id}`;

    return {success: true, link: bookingLink};
  } catch (error) {
    console.error('Error creating booking:', error);
    return {success: false, message: 'Buchung konnte nicht erstellt werden.'};
  }
}
