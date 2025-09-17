'use server';

import {db} from '@/lib/firebase/client';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {Booking, Room} from '@/lib/types';
import {DateRange} from 'react-day-picker';

export async function createHotelAction(prevState: any, formData: FormData) {
  const mealTypes = formData.getAll('mealTypes') as string[];
  const roomCategories = formData.getAll('roomCategories') as string[];

  const hotelData = {
    hotelName: formData.get('hotelName') as string,
    domain: formData.get('domain') as string,
    createdAt: new Date(),

    hotelier: {
      email: formData.get('hotelierEmail') as string,
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
    // TODO: Create user in Firebase Auth
    console.log(
      'Would create user with:',
      hotelData.hotelier.email,
      hotelData.hotelier.password
    );
    const docRef = await addDoc(collection(db, 'hotels'), hotelData);

    console.log('Hotel created with ID: ', docRef.id);
  } catch (error) {
    console.error('Error creating hotel:', error);
    return {
      message: 'Hotel could not be created.',
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
    guestName: formData.get('guestName') as string,
    checkIn: Timestamp.fromDate(date.from),
    checkOut: Timestamp.fromDate(date.to),
    price: parseFloat(formData.get('price') as string),
    mealType: formData.get('mealType') as string,
    language: formData.get('language') as string,
    internalNotes: (formData.get('internalNotes') as string) || '',
    rooms: rooms,
    status: 'Sent',
    createdAt: Timestamp.now(),
  };

  try {
    const bookingCollection = collection(db, 'hotels', hotelId, 'bookings');
    const docRef = await addDoc(bookingCollection, bookingData);

    const linkRef = await addDoc(collection(db, 'bookingLinks'), {
      hotelId: hotelId,
      bookingId: docRef.id,
      createdAt: Timestamp.now(),
      status: 'active',
      booking: {
        ...bookingData,
        id: docRef.id,
        hotelId: hotelId,
      },
    });

    revalidatePath(`/dashboard/${hotelId}/bookings`);

    const domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const bookingLink = `${domain}/guest/${linkRef.id}`;

    return {success: true, link: bookingLink};
  } catch (error) {
    console.error('Error creating booking:', error);
    return {success: false, message: 'Buchung konnte nicht erstellt werden.'};
  }
}
