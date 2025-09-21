'use server';

import { db } from '@/lib/firebase/admin'; // Nutzt die stabile Admin-Verbindung
import { FieldValue } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Booking, FellowTravelerData, GuestData } from '@/lib/types';


type FormState = {
  message: string;
  errors?: string[] | null;
  isValid?: boolean;
};

// Diese Funktion ist jetzt vollständig und speichert die Daten.
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


    // Daten aus dem Formular sauber extrahieren
    const rawData = Object.fromEntries(formData.entries());
    
    // Mitreisende strukturiert extrahieren
    const fellowTravelersMap = new Map<string, Partial<FellowTravelerData>>();
    for (const [key, value] of formData.entries()) {
        const match = key.match(/^fellowTraveler_(\d+)_(name|idFrontUrl|idBackUrl)$/);
        if (match && typeof value === 'string') {
            const [, id, field] = match;
            if (!fellowTravelersMap.has(id)) {
                fellowTravelersMap.set(id, {});
            }
            const traveler = fellowTravelersMap.get(id)!;
            (traveler as any)[field] = value;
        }
    }
    
    const fellowTravelers = Array.from(fellowTravelersMap.values())
        .filter(t => t.name && t.name.trim() !== '')
        .map(t => ({
            name: t.name || '',
            idFrontUrl: t.idFrontUrl || '',
            idBackUrl: t.idBackUrl || '',
        }));


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


    // Die Buchung in Firestore mit den neuen Gästedaten aktualisieren
     const hotelBookingRef = db.collection('hotels').doc(hotelId).collection('bookings').doc(bookingId);
    
    await hotelBookingRef.update({
        status: 'Data Provided',
        guestDetails: finalGuestData,
        paymentOption: rawData.paymentOption as 'deposit' | 'full',
        amountPaid: parseFloat(rawData.amountPaid as string),
        updatedAt: FieldValue.serverTimestamp(),
    });

    // Den Buchungslink als "verwendet" markieren
    await bookingLinkRef.update({
        status: 'used'
    });


  } catch (error) {
    console.error('CRITICAL: Error finalizing booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return {
      message: 'Ein unerwarteter Server-Fehler ist aufgetreten.',
      errors: [`Die Daten konnten nicht gespeichert werden. Details: ${errorMessage}`],
      isValid: false
    };
  }

  // Bei Erfolg zur Danke-Seite weiterleiten
  revalidatePath(`/guest/${linkId}`);
  revalidatePath(`/dashboard/${hotelId}/bookings`);
  redirect(`/guest/${linkId}/thank-you`);
}
