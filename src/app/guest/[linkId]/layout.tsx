import { Building } from 'lucide-react';

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="flex h-16 items-center border-b px-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <Building className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg">Hotel Hatzis</span>
        </div>
      </header>
      <main className="bg-muted/40 p-4 sm:p-8">{children}</main>
      <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WesoSystems
      </footer>
    </div>
  );
}
