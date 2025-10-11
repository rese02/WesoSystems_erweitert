'use client';

import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // We want to apply a different layout to the create-hotel and edit-hotel pages
  // to give more space to the form content.
  const isFormPage = pathname.includes('/create-hotel') || pathname.includes('/edit');

  return (
    <SidebarProvider>
      <DashboardSidebar role="agency" />
      <SidebarInset>
        <DashboardHeader />
        <main className={isFormPage ? "p-4 sm:p-6" : "p-4 sm:p-6 lg:p-10"}>
          <div className={isFormPage ? "mx-auto max-w-4xl" : ""}>
             {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
