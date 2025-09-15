'use client';

import {
  Building,
  CalendarPlus,
  Hotel,
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
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
      label: 'Neues Hotel',
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
          href: '#', // Placeholder link
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
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="font-bold text-lg">H</span>
          </div>
          <h1 className="text-xl font-headline font-semibold">hetzis</h1>
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
