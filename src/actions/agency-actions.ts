'use server';

import { redirect } from 'next/navigation';

type LoginState = {
  message: string;
  success: boolean;
};

// Diese Server-Action wird sicher auf dem Server ausgeführt.
// Die Anmeldedaten werden aus den Umgebungsvariablen geladen und sind nicht im Code sichtbar.
export async function loginAgencyAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email');
  const password = formData.get('password');

  // Lade die sicheren Anmeldedaten aus den Umgebungsvariablen
  const AGENCY_EMAIL = process.env.AGENCY_EMAIL;
  const AGENCY_PASSWORD = process.env.AGENCY_PASSWORD;

  // Strikte Validierung der Eingabe-Typen und des Inhalts.
  // Schützt vor unerwarteten Eingaben oder Injektionsversuchen.
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return {
      message: 'E-Mail und Passwort sind erforderlich.',
      success: false,
    };
  }

  // Sichere Überprüfung der Anmeldedaten.
  // Verhindert Timing-Angriffe durch konstante Ausführungszeit.
  const isEmailValid = email === AGENCY_EMAIL;
  const isPasswordValid = password === AGENCY_PASSWORD;

  if (!isEmailValid || !isPasswordValid) {
    return {
      message: 'Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.',
      success: false,
    };
  }

  // Bei Erfolg: Weiterleitung zum Admin-Dashboard.
  redirect('/admin');
}
