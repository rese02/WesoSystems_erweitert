'use server';

import { initializeAdminApp } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { timingSafeEqual } from 'crypto';

type LoginState = {
  message: string;
  success: boolean;
  token?: string;
};

// Diese Server-Aktion wird für den neuen, Cookie-basierten Flow verwendet.
export async function loginAgencyAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const adminApp = initializeAdminApp();
  const auth = getAuth(adminApp);
  
  const email = formData.get('email');
  const password = formData.get('password');

  const AGENCY_EMAIL = process.env.AGENCY_EMAIL;
  const AGENCY_PASSWORD = process.env.AGENCY_PASSWORD;

  if (!AGENCY_EMAIL || !AGENCY_PASSWORD) {
    console.error('Agency credentials are not set in environment variables.');
    return {
      message: 'Die Serverkonfiguration ist unvollständig. Bitte kontaktieren Sie den Support.',
      success: false,
    };
  }

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return {
      message: 'E-Mail und Passwort sind erforderlich.',
      success: false,
    };
  }

  // Timing-sichere Überprüfung, um Timing-Angriffe zu verhindern.
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
    return {
      message: 'Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.',
      success: false,
    };
  }

  try {
    // Dies ist eine statische UID für den Agentur-Benutzer.
    // In einem Szenario mit mehreren Agenturen müsste dies dynamisch sein.
    const agencyUid = 'agency_user_main'; 
    // Wir setzen eine benutzerdefinierte Rolle, um die Berechtigungen in den Firestore-Regeln zu steuern.
    await auth.setCustomUserClaims(agencyUid, { role: 'agency' });
    // Wir erstellen ein benutzerdefiniertes Token, das der Client verwendet, um sich bei Firebase anzumelden.
    // Der Client sendet dann das ID-Token an unsere API-Route, um das Sitzungscookie zu setzen.
    const customToken = await auth.createCustomToken(agencyUid);

    return {
      message: 'Anmeldung erfolgreich.',
      success: true,
      token: customToken,
    };
  } catch (error) {
    console.error('Error creating custom token for agency:', error);
    return {
      message: 'Ein Fehler bei der Authentifizierung ist aufgetreten.',
      success: false,
    };
  }
}
