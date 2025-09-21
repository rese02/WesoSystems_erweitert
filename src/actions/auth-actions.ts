'use server';

import { db } from '@/lib/firebase/client'; // Umstellung auf die Client-SDK
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { redirect } from 'next/navigation';

type LoginState = {
  message: string;
  success: boolean;
};

export async function loginHotelAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email');
  const password = formData.get('password');

  // Strikte Validierung der Eingabe-Typen und des Inhalts.
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return {
      message: 'E-Mail und Passwort sind erforderlich.',
      success: false,
    };
  }

  try {
    const hotelsRef = collection(db, 'hotels');
    // Die Abfrage sucht nach einer exakten Übereinstimmung der verschachtelten Felder.
    const q = query(
        hotelsRef,
        where('hotelier.email', '==', email),
        where('hotelier.password', '==', password),
        limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        message: 'Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.',
        success: false,
      };
    }

    // Extrahieren der Hotel-ID aus dem ersten gefundenen Dokument
    const hotelDoc = querySnapshot.docs[0];
    const hotelId = hotelDoc.id;

    // Bei Erfolg: Weiterleitung zum spezifischen Hotel-Dashboard.
    redirect(`/dashboard/${hotelId}`);

  } catch (error) {
    console.error('Login error:', error);
    return {
      message: 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      success: false,
    };
  }
}
