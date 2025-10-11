'use client';

import {
  Hotel,
  LayoutDashboard,
  Settings,
  BookOpen,
  Home,
  Users,
  MountainIcon,
  User,
  Package,
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
  hotelName?: string;
};

export function DashboardSidebar({ role, hotelId, hotelName }: DashboardSidebarProps) {
  const pathname = usePathname();

  const agencyLinks = [
    {
      href: '/admin',
      icon: <LayoutDashboard />,
      label: 'Hotelübersicht',
    },
    {
      href: '/admin/widget',
      icon: <Package />,
      label: 'Buchungswidget',
    },
    {
      href: '/admin/profile',
      icon: <User />,
      label: 'Agenturprofil',
    },
  ];

  const hotelierLinks = hotelId
    ? [
        {
          href: `/hotel-dashboard/${hotelId}`,
          icon: <LayoutDashboard />,
          label: 'Dashboard',
        },
        {
          href: `/hotel-dashboard/${hotelId}/bookings`,
          icon: <BookOpen />,
          label: 'Buchungen',
        },
        {
          href: `/hotel-dashboard/${hotelId}/settings`,
          icon: <Settings />,
          label: 'Stammdaten',
        },
         {
          href: `/hotel-dashboard/${hotelId}/profile`,
          icon: <User />,
          label: 'Profil',
        },
      ]
    : [];

  const links = role === 'agency' ? agencyLinks : hotelierLinks;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MountainIcon className="h-6 w-6" />
            </div>
          <h1 className="text-lg font-headline font-semibold capitalize">{role === 'agency' ? 'WesoSystems' : hotelName}</h1>
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
