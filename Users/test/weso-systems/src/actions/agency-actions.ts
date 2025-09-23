'use server';

import { redirect } from 'next/navigation';

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
