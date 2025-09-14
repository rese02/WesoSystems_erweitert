'use server';

import {
  validateGuestData,
  ValidateGuestDataInput,
} from '@/ai/flows/validate-guest-data';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

type FormState = {
  message: string;
  errors?: string[] | null;
  isValid?: boolean;
};

export async function finalizeBookingAction(
  linkId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());

  // This is a placeholder. In a real app, you'd get this from the booking link data.
  const bookingDetails = {
    checkInDate: '2024-08-01',
    checkOutDate: '2024-08-07',
    roomType: 'Doppelzimmer',
  };

  const guestData: ValidateGuestDataInput = {
    guestName: `${rawData.firstName} ${rawData.lastName}`,
    email: rawData.email as string,
    address: `${rawData.street}, ${rawData.zip} ${rawData.city}`,
    checkInDate: bookingDetails.checkInDate,
    checkOutDate: bookingDetails.checkOutDate,
    numberOfAdults: 2, // Placeholder
    numberOfChildren: 1, // Placeholder
    roomType: bookingDetails.roomType,
    specialRequests: (rawData.specialRequests as string) || '',
  };

  try {
    const validationResult = await validateGuestData(guestData);

    if (!validationResult.isValid) {
      return {
        message: 'Datenüberprüfung fehlgeschlagen. Bitte überprüfen Sie Ihre Eingaben.',
        errors: validationResult.validationErrors,
        isValid: false,
      };
    }

    // --- In a real app, you would now: ---
    // 1. Securely upload payment proof and ID documents to Firebase Storage.
    // 2. Get the download URLs.
    // 3. Update the booking document in Firestore with all guest data and file URLs.
    // 4. Set the booking status to 'Partial Payment' or 'Confirmed'.
    // 5. Deactivate the booking link.
    // 6. Trigger a confirmation email via Resend.

    // Revalidate the path to reflect updated data if needed
    revalidatePath(`/guest/${linkId}`);
  } catch (error) {
    console.error('Error finalizing booking:', error);
    return {
      message: 'Ein unerwarteter Fehler ist aufgetreten.',
      errors: ['Der Server konnte die Anfrage nicht verarbeiten.'],
      isValid: false,
    };
  }

  // Redirect to the thank you page on success
  redirect(`/guest/${linkId}/thank-you`);
}
