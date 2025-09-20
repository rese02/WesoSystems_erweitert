'use server';

import { getStorage } from 'firebase-admin/storage';
import { initAdmin } from '@/lib/firebase/admin';
import {v4 as uuidv4} from 'uuid';

export async function uploadFileAction(bookingId: string, file: File) {

    try {
        await initAdmin(); // Stellt sicher, dass die Admin-App initialisiert ist
        const bucket = getStorage().bucket();

        const fileExtension = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `bookings/${bookingId}/${fileName}`;

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const fileUpload = bucket.file(filePath);

        await fileUpload.save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
        });

        // Mache die Datei öffentlich lesbar, um die URL zu erhalten
        await fileUpload.makePublic();

        const publicUrl = fileUpload.publicUrl();

        return { success: true, url: publicUrl, message: "Datei erfolgreich hochgeladen" };

    } catch (error) {
        console.error("Error uploading file to Firebase Storage:", error);
        return { success: false, url: null, message: "Datei-Upload fehlgeschlagen." };
    }
}
