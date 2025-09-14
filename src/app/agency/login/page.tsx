import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function AgencyLoginPage() {
  return (
    <AuthLayout>
      <div className="flex justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Agentur-Login
            </CardTitle>
            <CardDescription>
              Melden Sie sich an, um Ihre Hotels zu verwalten.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@agentur.de"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" type="password" required />
            </div>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 transition-transform active:scale-95">
              <Link href="/admin">Anmelden</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
