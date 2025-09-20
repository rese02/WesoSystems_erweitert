'use server';

import { redirect } from 'next/navigation';

type LoginState = {
  message: string;
  success: boolean;
};

// Diese Server-Action wird sicher auf dem Server ausgeführt.
// Die Anmeldedaten sind hier hartcodiert und nicht im Client-Code sichtbar.
export async function loginAgencyAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const AGENCY_EMAIL = 'hallo@agentur-weso.it';
  const AGENCY_PASSWORD = 'Hallo-weso.2025!';

  if (!email || !password) {
    return {
      message: 'E-Mail und Passwort sind erforderlich.',
      success: false,
    };
  }

  // Sichere Überprüfung der Anmeldedaten
  const isEmailValid = email === AGENCY_EMAIL;
  const isPasswordValid = password === AGENCY_PASSWORD;

  if (!isEmailValid || !isPasswordValid) {
    return {
      message: 'Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.',
      success: false,
    };
  }

  // Bei Erfolg: Weiterleitung zum Admin-Dashboard.
  // Es wird kein Erfolgsstatus zurückgegeben, da die Weiterleitung den Prozess beendet.
  redirect('/admin');
}
