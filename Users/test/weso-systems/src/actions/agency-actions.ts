'use server';

import { redirect } from 'next/navigation';
import { timingSafeEqual } from 'crypto';

type LoginState = {
  message: string;
  success: boolean;
};

// Diese Server-Action wird sicher auf dem Server ausgeführt.
// Die Anmeldedaten sind hier sicher, da sie aus Umgebungsvariablen gelesen werden.
export async function loginAgencyAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email');
  const password = formData.get('password');

  // Sichere, serverseitige Definition der Anmeldedaten aus Umgebungsvariablen
  const AGENCY_EMAIL = process.env.AGENCY_EMAIL;
  const AGENCY_PASSWORD = process.env.AGENCY_PASSWORD;

  if (!AGENCY_EMAIL || !AGENCY_PASSWORD) {
    console.error('Agency credentials are not set in environment variables.');
    return {
      message: 'Die Serverkonfiguration ist unvollständig. Bitte kontaktieren Sie den Support.',
      success: false,
    };
  }

  // Strikte Validierung der Eingabe-Typen und des Inhalts.
  // Schützt vor unerwarteten Eingaben oder Injektionsversuchen.
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return {
      message: 'E-Mail und Passwort sind erforderlich.',
      success: false,
    };
  }

  // Sichere Überprüfung der Anmeldedaten mit timingSafeEqual, um Timing-Angriffe zu verhindern.
  // Wichtig: Die zu vergleichenden Puffer müssen die gleiche Länge haben.
  const inputEmailBuffer = Buffer.from(email);
  const storedEmailBuffer = Buffer.from(AGENCY_EMAIL);
  const inputPasswordBuffer = Buffer.from(password);
  const storedPasswordBuffer = Buffer.from(AGENCY_PASSWORD);

  let isEmailValid = false;
  if (inputEmailBuffer.length === storedEmailBuffer.length) {
    isEmailValid = timingSafeEqual(inputEmailBuffer, storedEmailBuffer);
  }

  let isPasswordValid = false;
  if (inputPasswordBuffer.length === storedPasswordBuffer.length) {
    isPasswordValid = timingSafeEqual(inputPasswordBuffer, storedPasswordBuffer);
  }


  if (!isEmailValid || !isPasswordValid) {
    // Generische Fehlermeldung, um das Enumerieren von Benutzern zu erschweren
    return {
      message: 'Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.',
      success: false,
    };
  }

  // Bei Erfolg wird die Client-Seite die Weiterleitung nach dem Setzen des Cookies übernehmen.
  // Wir geben hier nur den Erfolgsstatus zurück.
  return {
    message: 'Anmeldung erfolgreich.',
    success: true,
  }
}
