'use server';

import { initializeAdminApp } from '@/lib/firebase/admin';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Booking, FellowTravelerData, GuestData, Hotel } from '@/lib/types';
import { sendBookingConfirmation } from '@/lib/email';

const adminApp = initializeAdminApp();
const db = getFirestore(adminApp);

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

    const hotelRef = db.collection('hotels').doc(hotelId);
    const hotelSnap = await hotelRef.get();
    if (!hotelSnap.exists) {
        return { message: 'Fehler: Hotel nicht gefunden.', isValid: false };
    }
    const hotelData = hotelSnap.data() as Hotel;


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

    const priceString = rawData.amountPaid as string;
    const price = parseFloat(priceString);
    if (isNaN(price)) {
      return { message: 'Ungültiger Preis.', isValid: false };
    }

    // Die Buchung in Firestore mit den neuen Gästedaten aktualisieren
     const hotelBookingRef = db.collection('hotels').doc(hotelId).collection('bookings').doc(bookingId);
    
    await hotelBookingRef.update({
        status: 'Data Provided',
        guestDetails: finalGuestData,
        paymentOption: rawData.paymentOption as 'deposit' | 'full',
        amountPaid: price,
        updatedAt: FieldValue.serverTimestamp(),
    });

    // Den Buchungslink als "verwendet" markieren
    await bookingLinkRef.update({
        status: 'used',
        updatedAt: FieldValue.serverTimestamp(),
    });
    
    // E-Mail-Versand vorbereiten
    const updatedBookingDataForEmail: Booking = {
      ...bookingDetails,
      // Wichtig: Die ID muss hier explizit gesetzt werden, da sie im bookingDetails-Objekt vorhanden ist
      id: bookingId, 
      checkIn: (bookingDetails.checkIn as Timestamp).toDate(),
      checkOut: (bookingDetails.checkOut as Timestamp).toDate(),
      createdAt: (bookingDetails.createdAt as Timestamp).toDate(),
      guestDetails: finalGuestData,
      status: 'Data Provided',
      amountPaid: price,
      paymentOption: rawData.paymentOption as 'deposit' | 'full',
    };

    // E-Mail senden (ohne auf das Ergebnis zu warten, um den Gast nicht aufzuhalten)
    sendBookingConfirmation({ booking: updatedBookingDataForEmail, hotel: hotelData }).catch(emailError => {
        // Loggen des Fehlers im Hintergrund, falls der E-Mail-Versand fehlschlägt
        console.error('Hintergrund-Fehler beim Senden der Bestätigungs-E-Mail:', emailError);
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
