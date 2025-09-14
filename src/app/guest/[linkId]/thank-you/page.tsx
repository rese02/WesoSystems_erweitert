import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="pt-4 font-headline text-3xl">
            Vielen Dank!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ihre Buchung ist bestätigt. Sie erhalten in Kürze eine
            Bestätigungs-E-Mail mit allen Details.
          </p>
          <p className="text-sm">Wir freuen uns auf Ihren Besuch!</p>
          <div className="pt-4">
            <Button asChild variant="outline">
              <Link href="/">Zur Startseite</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
