import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MountainIcon } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-[#F7F7F7] p-4">
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(circle, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      <Card className="relative z-10 w-full max-w-md rounded-2xl border-none bg-white/80 p-8 shadow-lg backdrop-blur-sm">
          <CardHeader className="items-center p-0 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
                <MountainIcon className="h-6 w-6 text-gray-600" />
              </div>
              <span className="text-xl font-semibold">Alpenlink Booking</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 p-0">
            <CardTitle className="font-headline text-3xl font-bold text-center">
              Alpenlink Booking
            </CardTitle>
            <CardDescription className="text-center">
              Das moderne Buchungssystem für Ihr Hotel.
            </CardDescription>
            <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              <Button asChild size="lg" className="h-12 bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90">
                <Link href="/agency/login">
                  Agentur-Login
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 border-gray-300 bg-gray-100 text-base font-semibold text-gray-800 hover:bg-gray-200"
              >
                <Link href="/hotel/login">Hotel-Login</Link>
              </Button>
            </div>
          </CardContent>
      </Card>
    </main>
  );
}
