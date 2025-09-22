'use server';

import { db } from '@/lib/firebase/admin';
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

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return {
      message: 'E-Mail und Passwort sind erforderlich.',
      success: false,
    };
  }

  try {
    const hotelsRef = db.collection('hotels');
    const q = hotelsRef.where('hotelier.email', '==', email).limit(1);

    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return {
        message: 'Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.',
        success: false,
      };
    }

    const hotelDoc = querySnapshot.docs[0];
    const hotelData = hotelDoc.data();
    
    // WICHTIG: Sichere Überprüfung, ob das Passwort-Feld existiert, bevor darauf zugegriffen wird.
    if (!hotelData.hotelier || !hotelData.hotelier.password || hotelData.hotelier.password !== password) {
         return {
            message: 'Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.',
            success: false,
        };
    }
    
    const hotelId = hotelDoc.id;

    redirect(`/dashboard/${hotelId}`);

  } catch (error) {
    console.error('Login error:', error);
    return {
      message: 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      success: false,
    };
  }
}
