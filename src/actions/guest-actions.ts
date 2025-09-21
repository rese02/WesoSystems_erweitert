'use server';

import { db } from '@/lib/firebase/admin'; // Importiert unsere neue, sichere Admin-Verbindung
import { FieldValue } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Booking, GuestData } from '@/lib/types';
import { validateGuestData, ValidateGuestDataInput } from '@/ai/flows/validate-guest-data';

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

  const bookingLinkRef = db.collection('bookingLinks').doc(linkId);

  try {
    const bookingLinkSnap = await bookingLinkRef.get();

    if (!bookingLinkSnap.exists || bookingLinkSnap.data()?.status === 'used') {
        return {
        message: 'Ungültiger oder bereits verwendeter Buchungslink.',
        errors: ['Dieser Link ist nicht gültig oder abgelaufen.'],
        isValid: false,
        };
    }

    const bookingDetails = bookingLinkSnap.data()?.booking as Booking;
    if (!bookingDetails) {
         return { message: 'Fehler: Buchungsdetails nicht im Link gefunden.', isValid: false };
    }
    const hotelId = bookingDetails.hotelId;
    const bookingId = bookingDetails.id;

    // Daten aus dem Formular extrahieren
    const rawData = Object.fromEntries(formData.entries());
    
    const totalAdults = bookingDetails.rooms.reduce((sum, room) => sum + room.adults, 0);
    const totalChildren = bookingDetails.rooms.reduce((sum, room) => sum + room.children, 0);

    const checkInDate = new Date(bookingDetails.checkIn as any).toISOString();
    const checkOutDate = new Date(bookingDetails.checkOut as any).toISOString();

    const fellowTravelers = [];
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('fellowTraveler_') && typeof value === 'string' && value.trim() !== '') {
            fellowTravelers.push({ name: value });
        }
    }

    // Schritt 1: Daten mit KI validieren
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

    const validationResult = await validateGuestData(guestDataForValidation);

    if (!validationResult.isValid) {
      return {
        message: 'Datenüberprüfung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.',
        errors: validationResult.validationErrors,
        isValid: false,
      };
    }

    // Schritt 2: Gästedatenobjekt für die Datenbank erstellen
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

    // Schritt 3: Buchungsdokument in Firestore aktualisieren
    const hotelBookingRef = db.collection('hotels').doc(hotelId).collection('bookings').doc(bookingId);
    
    await hotelBookingRef.update({
        status: 'Data Provided',
        guestDetails: finalGuestData,
        paymentOption: rawData.paymentOption as 'deposit' | 'full',
        amountPaid: parseFloat(rawData.amountPaid as string),
        updatedAt: FieldValue.serverTimestamp(),
    });

    // Schritt 4: Buchungslink als "verwendet" markieren
    await bookingLinkRef.update({
        status: 'used'
    });

    revalidatePath(`/guest/${linkId}`);
    revalidatePath(`/dashboard/${hotelId}/bookings`);

  } catch (error) {
    console.error('CRITICAL: Error finalizing booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return {
      message: 'Ein unerwarteter Server-Fehler ist aufgetreten. Die Daten konnten nicht gespeichert werden.',
      errors: [`Details: ${errorMessage}`],
      isValid: false,
    };
  }

  // Bei Erfolg zur Danke-Seite weiterleiten
  redirect(`/guest/${linkId}/thank-you`);
}
