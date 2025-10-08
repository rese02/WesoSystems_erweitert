'use server';

import { initializeAdminApp } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { timingSafeEqual } from 'crypto';

type LoginState = {
  message: string;
  success: boolean;
  token?: string;
};

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
    // This is a placeholder UID for the agency user. 
    // In a real multi-agency scenario, you'd have a proper user management system.
    const agencyUid = 'agency_user_main'; 
    await auth.setCustomUserClaims(agencyUid, { role: 'agency' });
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
