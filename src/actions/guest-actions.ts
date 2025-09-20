'use server';

import {
  validateGuestData,
  ValidateGuestDataInput,
} from '@/ai/flows/validate-guest-data';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Booking, GuestData, Hotel } from '@/lib/types';
import { sendBookingConfirmation } from '@/lib/email';

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

  const bookingLinkRef = doc(db, 'bookingLinks', linkId);
  const bookingLinkSnap = await getDoc(bookingLinkRef);

  if (!bookingLinkSnap.exists() || bookingLinkSnap.data().status === 'used') {
    return {
      message: 'Ungültiger oder bereits verwendeter Buchungslink.',
      errors: ['Dieser Link ist nicht gültig oder abgelaufen.'],
      isValid: false,
    };
  }

  const bookingDetails = bookingLinkSnap.data().booking as Booking;
  const hotelId = bookingDetails.hotelId;

  const totalAdults = bookingDetails.rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = bookingDetails.rooms.reduce((sum, room) => sum + room.children, 0);

  const checkInDate = bookingDetails.checkIn instanceof Timestamp 
    ? bookingDetails.checkIn.toDate().toISOString() 
    : new Date(bookingDetails.checkIn as any).toISOString();
  const checkOutDate = bookingDetails.checkOut instanceof Timestamp 
    ? bookingDetails.checkOut.toDate().toISOString() 
    : new Date(bookingDetails.checkOut as any).toISOString();

  const fellowTravelers = [];
  for (const [key, value] of formData.entries()) {
      if (key.startsWith('fellowTraveler_') && typeof value === 'string' && value.trim() !== '') {
          fellowTravelers.push({ name: value });
      }
  }

  const guestDataForValidation: ValidateGuestDataInput = {
    guestName: `${rawData.firstName} ${rawData.lastName}`,
    email: rawData.email as string,
    address: `${rawData.street}, ${rawData.zip} ${rawData.city}`,
    checkInDate: checkInDate,
    checkOutDate: checkOutDate,
    numberOfAdults: totalAdults, 
    numberOfChildren: totalChildren,
    roomType: bookingDetails.rooms.map(r => r.type).join(', '),
    specialRequests: (rawData.specialRequests as string) || '',
  };

  try {
    const validationResult = await validateGuestData(guestDataForValidation);

    if (!validationResult.isValid) {
      return {
        message: 'Datenüberprüfung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.',
        errors: validationResult.validationErrors,
        isValid: false,
      };
    }

    const finalGuestData: GuestData = {
        firstName: rawData.firstName as string,
        lastName: rawData.lastName as string,
        email: rawData.email as string,
        phone: rawData.phone as string,
        birthDate: rawData.birthDate as string,
        street: rawData.street as string,
        zip: rawData.zip as string,
        city: rawData.city as string,
        specialRequests: (rawData.specialRequests as string) || '',
        fellowTravelers: fellowTravelers,
        documentUrls: {
            idFront: rawData.idFrontUrl as string || '',
            idBack: rawData.idBackUrl as string || '',
            paymentProof: rawData.paymentProofUrl as string || '',
        }
    }

    const hotelBookingRef = doc(db, 'hotels', hotelId, 'bookings', bookingDetails.id);
    
    await updateDoc(hotelBookingRef, {
        status: 'Data Provided',
        guestDetails: finalGuestData,
        paymentOption: rawData.paymentOption as 'deposit' | 'full',
        amountPaid: parseFloat(rawData.amountPaid as string),
    });

    await updateDoc(bookingLinkRef, {
        status: 'used'
    });
    
    // E-Mail-Versand vorerst auskommentiert, um uns auf die Datenspeicherung zu konzentrieren
    /*
    const hotelRef = doc(db, 'hotels', hotelId);
    const hotelSnap = await getDoc(hotelRef);
    if (hotelSnap.exists()) {
        const hotelData = hotelSnap.data() as Hotel;
        try {
            const hotelCreatedAt = hotelData.createdAt instanceof Timestamp 
                ? hotelData.createdAt.toDate() 
                : new Date(hotelData.createdAt);

            const fullHotelData: Hotel = {
                id: hotelSnap.id,
                ...hotelData,
                createdAt: hotelCreatedAt.toISOString(),
            } as Hotel;
            
            const updatedBooking: Booking = { 
                ...bookingDetails, 
                checkIn: bookingDetails.checkIn instanceof Timestamp ? bookingDetails.checkIn.toDate() : new Date(bookingDetails.checkIn as any),
                checkOut: bookingDetails.checkOut instanceof Timestamp ? bookingDetails.checkOut.toDate() : new Date(bookingDetails.checkOut as any),
                createdAt: bookingDetails.createdAt instanceof Timestamp ? bookingDetails.createdAt.toDate() : new Date(bookingDetails.createdAt as any),
                guestDetails: finalGuestData,
                status: 'Data Provided',
                paymentOption: rawData.paymentOption as 'deposit' | 'full',
                amountPaid: parseFloat(rawData.amountPaid as string),
            };

            await sendBookingConfirmation({
                booking: updatedBooking,
                hotel: fullHotelData,
            });
        } catch(emailError) {
            console.error("Failed to send confirmation email:", emailError);
             return {
              message: 'Ihre Daten wurden gespeichert, aber die Bestätigungs-E-Mail konnte nicht gesendet werden. Überprüfen Sie die SMTP-Einstellungen des Hotels.',
              errors: ['Bitte kontaktieren Sie das Hotel direkt, um die Bestätigung sicherzustellen.'],
              isValid: false, 
            };
        }
    }
    */


    revalidatePath(`/guest/${linkId}`);
    revalidatePath(`/dashboard/${hotelId}/bookings`);

  } catch (error) {
    console.error('Error finalizing booking:', error);
    return {
      message: 'Ein unerwarteter Server-Fehler ist aufgetreten. Die Daten konnten nicht gespeichert werden.',
      errors: ['Der Server konnte die Anfrage nicht verarbeiten.'],
      isValid: false,
    };
  }

  redirect(`/guest/${linkId}/thank-you`);
}
