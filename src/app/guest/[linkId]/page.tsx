import { BookingSummaryCard } from '@/components/guest/booking-summary-card';
import { BookingWizard } from '@/components/guest/booking-wizard';
import { db } from '@/lib/firebase/client';
import { GuestLinkData } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';


async function getBookingLinkData(linkId: string): Promise<GuestLinkData | null> {
    const linkRef = doc(db, 'bookingLinks', linkId);
    const linkSnap = await getDoc(linkRef);

    if (!linkSnap.exists() || linkSnap.data().status === 'used') {
        return null;
    }
    
    const data = linkSnap.data();

    // The booking data is nested inside the link document.
    const booking = data.booking;

    if (booking.status !== 'Pending') {
         return (
            <div className="mx-auto max-w-2xl py-12">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Buchung bereits bearbeitet</AlertTitle>
                  <AlertDescription>
                    Die Daten für diese Buchung wurden bereits übermittelt.
                  </AlertDescription>
                </Alert>
            </div>
         )
    }
    
    // We also need some hotel info, which is also nested.
    const hotel = data.hotel;

    return { id: linkSnap.id, booking, hotel };
}


export default async function GuestBookingPage({
  params,
}: {
  params: { linkId: string };
}) {

  const linkData = await getBookingLinkData(params.linkId);

  if (!linkData) {
     return (
        <div className="mx-auto max-w-2xl py-12">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Buchungslink ungültig</AlertTitle>
              <AlertDescription>
                Dieser Link ist entweder abgelaufen oder existiert nicht. Bitte kontaktieren Sie das Hotel.
              </Aler