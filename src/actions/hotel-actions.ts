'use server';

import { db } from '@/lib/firebase/client';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createHotelAction(prevState: any, formData: FormData) {

  const mealTypes = formData.getAll('mealTypes') as string[];
  const roomCategories = formData.getAll('roomCategories') as string[];

  const hotelData = {
    hotelName: formData.get('hotelName') as string,
    domain: formData.get('domain') as string,
    createdAt: new Date(),

    hotelier: {
      email: formData.get('hotelierEmail') as string,
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
    }
  };

  try {
    // In einer echten Anwendung mit Firebase Admin SDK würde hier der Benutzer erstellt
    // const hotelierEmail = formData.get('hotelierEmail') as string;
    // const hotelierPassword = formData.get('hotelierPassword') as string;
    // const userRecord = await auth.createUser({ email: hotelierEmail, password: hotelierPassword });
    // await auth.setCustomUserClaims(userRecord.uid, { role: 'hotelier', hotelId: docRef.id });
    
    // Da wir clientseitig sind, können wir den Benutzer nicht direkt erstellen.
    // Wir speichern die Daten in Firestore. Die Benutzererstellung wäre ein nächster Schritt.
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
