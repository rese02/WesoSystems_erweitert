import { BookingSummaryCard } from '@/components/guest/booking-summary-card';
import { BookingWizard } from '@/components/guest/booking-wizard';

export default function GuestBookingPage({
  params,
}: {
  params: { linkId: string };
}) {
  // In a real app, you would fetch booking link data here based on linkId
  // and show an error page if the link is invalid or expired.

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BookingWizard linkId={params.linkId} />
        </div>
        <div className="lg:col-span-1">
          <BookingSummaryCard />
        </div>
      </div>
    </div>
  );
}
