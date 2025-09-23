'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Building } from 'lucide-react';
import Link from 'next/link';
import { Hotel } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';

export function UserNav({ hotelData }: { hotelData?: Hotel }) {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.hotelId as string;
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Redirect to the homepage after successful logout
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Bestimme den Link für das Profil basierend darauf, ob es ein Hotelier oder Admin ist
  const profileLink = hotelId ? `/dashboard/${hotelId}/profile` : '/admin/profile';
  const displayName = hotelData?.hotelName || 'Agentur';
  const displayEmail = hotelData?.hotelier?.email || 'hallo@agentur-weso.it';
  const displayAvatarSrc = hotelData?.logoUrl;
  const displayAvatarFallback = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {displayAvatarSrc ? (
              <AvatarImage src={displayAvatarSrc} alt={displayName} className="object-contain"/>
            ) : (
              <AvatarFallback>{displayAvatarFallback}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {displayEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={profileLink}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Abmelden</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
