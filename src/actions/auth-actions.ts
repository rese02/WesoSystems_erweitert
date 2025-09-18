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
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
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
