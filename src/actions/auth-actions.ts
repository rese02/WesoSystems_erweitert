'use server';

import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
  // Schützt vor unerwarteten Eingaben oder Injektionsversuchen.
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return {
      message: 'E-Mail und Passwort sind erforderlich.',
      success: false,
    };
  }

  const hotelsRef = collection(db, 'hotels');
  const q = query(
    hotelsRef,
    where('hotelier.email', '==', email),
    where('hotelier.password', '==', password)
  );

  try {
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        message: 'Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.',
        success: false,
      };
    }

    // Assuming one email belongs to one hotel
    const hotelDoc = querySnapshot.docs[0];
    const hotelId = hotelDoc.id;

    // On success, we don't return state but redirect instead
    redirect(`/dashboard/${hotelId}`);
    
  } catch (error) {
    console.error('Login error:', error);
    return {
      message: 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      success: false,
    };
  }
}
