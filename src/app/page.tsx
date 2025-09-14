import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const landingBg = PlaceHolderImages.find(
    (img) => img.id === 'landing-background'
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-8">
      {landingBg && (
        <Image
          src={landingBg.imageUrl}
          alt={landingBg.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={landingBg.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-background/30 dark:bg-black/50" />

      <div className="relative z-10 flex flex-col items-center text-center text-white">
        <h1 className="font-headline text-5xl font-extrabold tracking-tight text-white drop-shadow-md md:text-7xl">
          WesoSystems
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow-sm">
          Das intuitive und sichere Buchungssystem, das Agenturen, Hoteliers und
          Gäste begeistert.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/agency/login">
              Agentur-Login
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="bg-white/90 text-primary hover:bg-white"
          >
            <Link href="/hotel/login">Hotelier-Login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
