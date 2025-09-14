import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const landingBg = PlaceHolderImages.find(
    (img) => img.id === 'landing-background'
  );

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4">
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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
