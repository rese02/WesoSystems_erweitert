import { Building } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

async function getHotelName(linkId: string): Promise<string> {
    try {
        const linkRef = doc(db, 'bookingLinks', linkId);
        const linkSnap = await getDoc(linkRef);
        if (linkSnap.exists()) {
            return linkSnap.data().hotel.hotelName || 'Ihr Hotel';
        }
        return 'Ihr Hotel';
    } catch (error) {
        console.error("Failed to fetch hotel name:", error);
        return 'Ihr Hotel';
    }
}

export default async function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { linkId: string };
}) {
  const hotelName = await getHotelName(params.linkId);
  return (
    <div>
      <header className="flex h-16 items-center border-b px-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Building className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg">{hotelName}</span>
        </div>
      </header>
      <main className="bg-muted/40 p-4 sm:p-8">{children}</main>
      <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WesoSystems
      </footer>
    </div>
  );
}
