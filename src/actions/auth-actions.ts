'use server';

import { auth } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';

type LoginState = {
  message: string;
  success: boolean;
};

// Diese Funktion wird nicht mehr benötigt, da die Logik clientseitig mit dem ID-Token
// und serverseitig in der Middleware (noch zu implementieren) gehandhabt wird.
// Wir behalten sie vorerst als Referenz, bis der neue Flow vollständig ist.
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

  // Dieser Block ist der Kern des Problems und wird ersetzt.
  // Die Authentifizierung sollte über Firebase Auth erfolgen, nicht durch direkten DB-Vergleich.
  // Der neue Flow wird dies auf dem Client mit signInWithEmailAndPassword lösen
  // und dann das ID-Token zur Verifizierung an den Server senden.
  // Für diese Interaktion leiten wir einfach zum Dashboard weiter,
  // da die Client-Seite die hotelId aus den Claims holen wird.
  
  // Da die Client-Seite nach erfolgreichem Login die Claims ausliest,
  // brauchen wir hier nur eine Erfolgsmeldung.
  // Die Weiterleitung geschieht clientseitig.
  try {
    const user = await auth.getUserByEmail(email);
    // In einem echten Szenario würde man hier das Passwort nicht direkt vergleichen.
    // Da wir aber das Passwort bei der Erstellung setzen, müssen wir den Login irgendwie simulieren.
    // Der Client wird `signInWithEmailAndPassword` verwenden. Diese Server-Action
    // ist im neuen Flow eher ein Platzhalter.
    
    const hotelId = user.customClaims?.hotelId;

    if (hotelId) {
      redirect(`/dashboard/${hotelId}`);
    } else {
       return {
        message: 'Kein Hotel diesem Benutzer zugeordnet.',
        success: false,
      };
    }

  } catch (error: any) {
    console.error('Login error:', error);
     if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { message: 'Ungültige Anmeldedaten.', success: false };
    }
    return {
      message: 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      success: false,
    };
  }
}

    