'use server';

import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import { Booking, Hotel } from './types';
import BookingConfirmationEmail from '@/components/email/booking-confirmation-email';

interface EmailPayload {
    booking: Booking;
    hotel: Hotel;
}

export async function sendBookingConfirmation({ booking, hotel }: EmailPayload) {
    
    const transporter = nodemailer.createTransport({
        host: hotel.smtp.host,
        port: hotel.smtp.port,
        secure: hotel.smtp.port === 465, // true for 465, false for other ports
        auth: {
            user: hotel.smtp.user,
            pass: hotel.smtp.appPass,
        },
    });

    const emailHtml = render(BookingConfirmationEmail({ booking, hotel }));

    const options = {
        from: `"${hotel.hotelName}" <${hotel.smtp.user}>`,
        to: booking.guestDetails?.email,
        subject: `Ihre Buchungsbestätigung vom ${hotel.hotelName} - Buchungsnr: ${booking.id.substring(0, 8).toUpperCase()}`,
        html: emailHtml,
    };

    try {
        const info = await transporter.sendMail(options);
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent.');
    }
}
