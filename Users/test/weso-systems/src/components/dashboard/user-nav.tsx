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
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { Hotel } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';


async function clearTokenCookie() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Failed to clear auth cookie:', error);
  }
}

export function UserNav({ hotelData }: { hotelData?: Hotel }) {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.hotelId as string;
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      if (!hotelId) { // Only clear cookie for agency logout
          await clearTokenCookie();
      }
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const isAgency = !hotelId;
  const profileLink = isAgency ? '/admin/profile' : `/dashboard/${hotelId}/profile`;
  const displayName = hotelData?.hotelName || 'Agentur';
  const displayEmail = hotelData?.hotelier?.email || process.env.NEXT_PUBLIC_AGENCY_EMAIL || 'agentur@weso.it';
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
