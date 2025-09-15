'use client';
import { Button } from '../ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from './user-nav';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export function DashboardHeader() {
  const params = useParams<{ hotelId: string }>();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1" />
      <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={`/dashboard/${params.hotelId}/bookings/create`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Neue Buchung
          </Link>
        </Button>
      <UserNav />
    </header>
  );
}
