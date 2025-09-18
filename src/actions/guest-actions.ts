'use server';

import {
  validateGuestData,
  ValidateGuestDataInput,
} from '@/ai/flows/validate-guest-data';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Booking } from '@/lib/types';

type FormState = {
  message: string;
  errors?: string[] | null;
  isValid?: boolean;
};

export async function finalizeBookingAction(
  linkId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());

  const bookingRef = doc(db, 'bookingLinks', linkId);
  const bookingSnap = await getDoc(bookingRef);

  if (!bookingSnap.exists()) {
    return {
      message: 'Ungültiger Buchungslink.',
      errors: ['Dieser Link ist nicht gültig oder abgelaufen.'],
      isValid: false,
    };
  }

  const bookingDetails = bookingSnap.data().booking as Booking;
  const hotelId = bookingDetails.hotelId;

  const totalAdults = bookingDetails.rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = bookingDetails.rooms.reduce((sum, room) => sum + room.children, 0);

  const guestData: ValidateGuestDataInput = {
    guestName: `${rawData.firstName} ${rawData.lastName}`,
    email: rawData.email as string,
    address: `${rawData.street}, ${rawData.zip} ${rawData.city}`,
    checkInDate: bookingDetails.checkIn.toDate().toISOString(),
    checkOutDate: bookingDetails.checkOut.toDate().toISOString(),
    numberOfAdults: totalAdults, 
    numberOfChildren: totalChildren,
    roomType: bookingDetails.rooms.map(r => r.type).join(', '),
    specialRequests: (rawData.specialRequests as string) || '',
  };

  try {
    const validationResult = await validateGuestData(guestData);

    if (!validationResult.isValid) {
      return {
        message: 'Datenüberprüfung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.',
        errors: validationResult.validationErrors,
        isValid: false,
      };
    }

    const finalGuestData = {
        firstName: rawData.firstName as string,
        lastName: rawData.lastName as string,
        email: rawData.email as string,
        phone: rawData.phone as string,
        birthDate: rawData.birthDate as string,
        street: rawData.street as string,
        zip: rawData.zip as string,
        city: rawData.city as string,
        specialRequests: (rawData.specialRequests as string) || '',
        // fellowTravelers would be collected here
    }

    const hotelBookingRef = doc(db, 'hotels', hotelId, 'bookings', bookingDetails.id);
    
    await updateDoc(hotelBookingRef, {
        status: 'Data Provided',
        guestDetails: finalGuestData
    });

    // Deactivate the booking link
    await updateDoc(bookingRef, {
        status: 'used'
    })

    revalidatePath(`/guest/${linkId}`);
    revalidatePath(`/dashboard/${hotelId}/bookings`);

  } catch (error) {
    console.error('Error finalizing booking:', error);
    return {
      message: 'Ein unerwarteter Fehler ist aufgetreten.',
      errors: ['Der Server konnte die Anfrage nicht verarbeiten.'],
      isValid: false,
    };
  }

  redirect(`/guest/${linkId}/thank-you`);
}
