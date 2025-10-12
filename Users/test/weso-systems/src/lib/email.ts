'use server';

import nodemailer from 'nodemailer';
import { Booking, Hotel } from './types';
import { bookingConfirmationEmailTemplate } from '@/components/email/booking-confirmation-email';
import { db } from './firebase/admin';

interface EmailPayload {
    booking: Booking;
    hotel: Hotel;
}

export async function sendBookingConfirmation({ booking, hotel }: EmailPayload) {
    if (!booking.guestDetails?.email) {
        console.error("E-Mail-Versand fehlgeschlagen: Gast-E-Mail ist nicht verfügbar.", {bookingId: booking.id});
        return { success: false, message: 'Guest email is not available.' };
    }
    
    // Validierung der SMTP-Daten
    if (!hotel.smtp || !hotel.smtp.host || !hotel.smtp.user || !hotel.smtp.appPass) {
        console.error("E-Mail-Versand fehlgeschlagen: SMTP-Konfiguration unvollständig.", {hotelId: hotel.id});
        return { success: false, message: 'SMTP configuration is incomplete.' };
    }

    const transporter = nodemailer.createTransport({
        host: hotel.smtp.host,
        port: hotel.smtp.port,
        secure: hotel.smtp.port === 465, // true for 465, false for other ports
        auth: {
            user: hotel.smtp.user,
            pass: hotel.smtp.appPass,
        },
    });

    const emailHtml = bookingConfirmationEmailTemplate({ booking, hotel });

    const lang = booking.language || 'de';
    const bookingIdForSubject = booking.id ? booking.id.substring(0, 8).toUpperCase() : 'N/A';
    
    const subjects = {
        de: `Ihre Buchungsbestätigung vom ${hotel.hotelName} - Buchungsnr: ${bookingIdForSubject}`,
        en: `Your booking confirmation from ${hotel.hotelName} - Booking no: ${bookingIdForSubject}`,
        it: `La Sua conferma di prenotazione da ${hotel.hotelName} - N. prenotazione: ${bookingIdForSubject}`,
    }

    const options = {
        from: `"${hotel.hotelName}" <${hotel.smtp.user}>`,
        to: booking.guestDetails.email,
        subject: subjects[lang],
        html: emailHtml,
    };

    try {
        const info = await transporter.sendMail(options);
        console.log('Bestätigungs-E-Mail erfolgreich gesendet: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Fehler beim Senden der E-Mail:', error);
        // Wir werfen keinen Fehler, um den Benutzerfluss nicht zu blockieren, aber wir geben einen Fehlerstatus zurück.
        return { success: false, message: 'Email could not be sent.' };
    }
}
