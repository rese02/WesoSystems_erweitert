'use client';

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
import { AlertCircle, Loader2, MountainIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';


async function setTokenCookie(token: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to set auth cookie:', error);
    return false;
  }
}

export default function HotelLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      const idTokenResult = await user.getIdTokenResult();
      const hotelId = idTokenResult.claims.hotelId as string | undefined;

      if (idTokenResult.claims.role === 'hotelier' && hotelId) {
        const cookieSet = await setTokenCookie(idToken);
        if (cookieSet) {
          router.push(`/dashboard/${hotelId}`);
        } else {
          setError('Sitzung konnte nicht erstellt werden. Bitte versuchen Sie es erneut.');
          await clientAuth.signOut();
        }
      } else {
        setError('Sie haben keine Berechtigung, auf dieses Dashboard zuzugreifen.');
        await clientAuth.signOut();
      }
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.');
          break;
        default:
          setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
          break;
      }
      console.error(err);
    } finally {
        setIsPending(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm rounded-2xl border-none bg-white/80 p-8 shadow-lg backdrop-blur-sm">
        <CardHeader className="items-center p-0 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
            <MountainIcon className="h-6 w-6 text-gray-600" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleLogin} className="grid gap-4">
              <div className="text-center mb-4">
              <CardTitle className="font-headline text-2xl font-bold">
                  Hotel-Login
              </CardTitle>
              <CardDescription className="mt-1">
                  Melden Sie sich bei Ihrem Hotel-Dashboard an.
              </CardDescription>
              </div>
              <div className="grid gap-2">
              <Label htmlFor="hotel-email">E-Mail</Label>
              <Input
                  id="hotel-email"
                  name="email"
                  type="email"
                  placeholder="Ihre E-Mail"
                  required
                  className="h-12 text-base"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
              />
              </div>
              <div className="grid gap-2">
              <Label htmlFor="hotel-password">Passwort</Label>
              <Input 
                id="hotel-password" 
                name="password" 
                type="password" 
                required 
                className="h-12 text-base" 
                autoComplete="current-password" 
                placeholder="Ihr Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              </div>

              {error && (
                   <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fehler</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}

              <div className="grid gap-3 pt-4">
                  <Button type="submit" size="lg" className="w-full h-12 bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95" disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Anmelden
                  </Button>
                  <Button asChild variant="link" size="sm" className="text-muted-foreground hover:text-primary font-normal">
                    <Link href="/">Zurück zur Auswahl</Link>
                  </Button>
              </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
