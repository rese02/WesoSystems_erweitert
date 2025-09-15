'use server';

import { db } from '@/lib/firebase/client';
import { addDoc, collection } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createHotelAction(formData: FormData) {
  const hotelData = {
    hotelName: formData.get('hotelName') as string,
    domain: formData.get('domain') as string,
    hotelierEmail: formData.get('hotelierEmail') as string,
    contactEmail: formData.get('contactEmail') as string,
    contactPhone: formData.get('contactPhone') as string,
    accountHolder: formData.get('accountHolder') as string,
    iban: formData.get('iban') as string,
    bic: formData.get('bic') as string,
    bankName: formData.get('bankName') as string,
    createdAt: new Date().toISOString(),
  };

  try {
    // In a real app, you would also create the user in Firebase Auth
    // const userRecord = await auth.createUser({ email: hotelData.hotelierEmail });
    // await addDoc(collection(db, 'hotels'), { ...hotelData, ownerUid: userRecord.uid });

    // For now, just add to Firestore without a real owner
    const docRef = await addDoc(collection(db, 'hotels'), hotelData);

    console.log('Hotel created with ID: ', docRef.id);
  } catch (error) {
    console.error('Error creating hotel:', error);
    // Here you would handle errors, e.g., return a message to the user
    return {
      message: 'Hotel could not be created.',
    };
  }

  // Revalidate the agency dashboard to show the new hotel
  revalidatePath('/admin');
  // Redirect to the agency dashboard
  redirect('/admin');
}
