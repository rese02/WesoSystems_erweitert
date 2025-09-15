'use client';

import {
  Hotel,
  LayoutDashboard,
  Settings,
  BookOpen,
  Home,
  Users,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

type DashboardSidebarProps = {
  role: 'agency' | 'hotelier';
  hotelId?: string;
};

export function DashboardSidebar({ role, hotelId }: DashboardSidebarProps) {
  const pathname = usePathname();

  const agencyLinks = [
    {
      href: '/admin',
      icon: <LayoutDashboard />,
      label: 'Übersicht',
    },
    {
      href: '/admin/create-hotel',
      icon: <Hotel />,
      label: 'Hotel anlegen',
    },
    {
      href: '#',
      icon: <Users />,
      label: 'Team',
    },
     {
      href: '/',
      icon: <Home />,
      label: 'Zur Startseite',
    },
  ];

  const hotelierLinks = hotelId
    ? [
        {
          href: `/dashboard/${hotelId}`,
          icon: <LayoutDashboard />,
          label: 'Dashboard',
        },
        {
          href: `/dashboard/${hotelId}/bookings`,
          icon: <BookOpen />,
          label: 'Buchungen',
        },
        {
          href: '#',
          icon: <Settings />,
          label: 'Einstellungen',
        },
      ]
    : [];

  const links = role === 'agency' ? agencyLinks : hotelierLinks;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-5 w-5"><path fill="currentColor" d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m42.44 150.44l-32.22-32.22a4 4 0 0 0-5.66 0l-32.22 32.22a4 4 0 0 1-5.66-5.66l32.22-32.22a4 4 0 0 0 0-5.66L94.68 98.68a4 4 0 0 1 5.66-5.66l32.22 32.22a4 4 0 0 0 5.66 0l32.22-32.22a4 4 0 1 1 5.66 5.66L143.88 128l32.22 32.22a4 4 0 0 1 0 5.66a4 4 0 0 1-2.83 1.18a4 4 0 0 1-2.83-1.18"/></svg>
            </div>
          <h1 className="text-lg font-headline font-semibold capitalize">{role === 'agency' ? 'WesoSystems' : hotelId}</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={{ children: link.label }}
              >
                <Link href={link.href}>
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
