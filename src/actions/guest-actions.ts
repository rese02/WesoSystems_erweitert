'use server';

import {
  validateGuestData,
  ValidateGuestDataInput,
} from '@/ai/flows/validate-guest-data';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Booking, Hotel } from '@/lib/types';
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

  if (!bookingLinkSnap.exists()) {
    return {
      message: 'Ungültiger Buchungslink.',
      errors: ['Dieser Link ist nicht gültig oder abgelaufen.'],
      isValid: false,
    };
  }

  const bookingDetails = bookingLinkSnap.data().booking as Booking;
  const hotelId = bookingDetails.hotelId;

  // Lade das vollständige Hotel-Dokument, um auf alle Daten (z. B. SMTP) zugreifen zu können
  const hotelRef = doc(db, 'hotels', hotelId);
  const hotelSnap = await getDoc(hotelRef);

  if (!hotelSnap.exists()) {
     return {
      message: 'Hotel nicht gefunden.',
      errors: ['Das zugehörige Hotel konnte nicht gefunden werden.'],
      isValid: false,
    };
  }
  const hotelData = hotelSnap.data() as Hotel;

  const totalAdults = bookingDetails.rooms.reduce((sum, room) => sum + room.adults, 0);
  const totalChildren = bookingDetails.rooms.reduce((sum, room) => sum + room.children, 0);

  // Konvertiere Firestore Timestamps in ISO-Strings für die AI-Flow-Validierung
  const checkInDate = bookingDetails.checkIn instanceof Timestamp 
    ? bookingDetails.checkIn.toDate().toISOString() 
    : new Date(bookingDetails.checkIn as any).toISOString();
  const checkOutDate = bookingDetails.checkOut instanceof Timestamp 
    ? bookingDetails.checkOut.toDate().toISOString() 
    : new Date(bookingDetails.checkOut as any).toISOString();


  const guestData: ValidateGuestDataInput = {
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
        fellowTravelers: [], // Dies würde aus dem Formular gesammelt, wenn implementiert
    }

    const hotelBookingRef = doc(db, 'hotels', hotelId, 'bookings', bookingDetails.id);
    
    // Aktualisiere die Buchung in der 'bookings' Subkollektion des Hotels
    await updateDoc(hotelBookingRef, {
        status: 'Data Provided',
        guestDetails: finalGuestData
    });

    // Deaktiviere den Buchungslink
    await updateDoc(bookingLinkRef, {
        status: 'used'
    });

    // Sende die Bestätigungs-E-Mail
    try {
        // Übergib das vollständige hotelData-Objekt, das die SMTP-Konfiguration enthält
        await sendBookingConfirmation({
            booking: { ...bookingDetails, guestDetails: finalGuestData },
            hotel: hotelData,
        });
    } catch(emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Fail the transaction if the email fails, but log it for monitoring.
        // For debugging, we can return an error to the user
         return {
          message: 'Ihre Daten wurden gespeichert, aber die Bestätigungs-E-Mail konnte nicht gesendet werden. Überprüfen Sie die SMTP-Einstellungen des Hotels.',
          errors: ['Bitte kontaktieren Sie das Hotel direkt, um die Bestätigung sicherzustellen.'],
          isValid: false, // Auf false setzen, um den Fehler auf der Seite anzuzeigen
        };
    }


    revalidatePath(`/guest/${linkId}`);
    revalidatePath(`/dashboard/${hotelId}/bookings`);

  } catch (error) {
    console.error('Error finalizing booking:', error);
    return {
      message: 'Ein unerwarteter Server-Fehler ist aufgetreten.',
      errors: ['Der Server konnte die Anfrage nicht verarbeiten.'],
      isValid: false,
    };
  }

  redirect(`/guest/${linkId}/thank-you`);
}
