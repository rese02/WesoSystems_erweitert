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
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error('Failed to set auth cookie:', error);
  }
}

export default function AgencyLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    // --- Hardcoded Agency Credentials for Demo ---
    const AGENCY_EMAIL = process.env.NEXT_PUBLIC_AGENCY_EMAIL;
    const AGENCY_PASSWORD = process.env.NEXT_PUBLIC_AGENCY_PASSWORD;

    if (!AGENCY_EMAIL || !AGENCY_PASSWORD) {
        setError('Serverkonfiguration unvollständig. Admin-Zugangsdaten fehlen.');
        setIsPending(false);
        return;
    }
    
    // This is a temporary, client-side check for the agency user.
    // In a real scenario, the agency user would also exist in Firebase Auth.
    // To simulate a successful login and get a token for the middleware,
    // we will log in with a valid *hotelier* user and then check the role here.
    if (email !== AGENCY_EMAIL || password !== AGENCY_PASSWORD) {
         setError('Ungültige Anmeldedaten. Bitte versuchen Sie es erneut.');
         setIsPending(false);
         return;
    }

    try {
      // NOTE: This is a conceptual workaround for the demo.
      // We are "logging in" with the hardcoded agency credentials on the client,
      // but to get a valid Firebase token that the middleware can verify,
      // we must *actually* sign in a Firebase user.
      // We assume a dedicated Firebase account exists for the agency role.
      // For this example, we use the same environment variables.
      const userCredential = await signInWithEmailAndPassword(clientAuth, AGENCY_EMAIL, AGENCY_PASSWORD);
      const user = userCredential.user;

      const idTokenResult = await user.getIdTokenResult(true);
      
      if (idTokenResult.claims.role !== 'agency') {
          setError('Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.');
          await clientAuth.signOut();
          setIsPending(false);
          return;
      }
      
      // Set the token in an HTTPOnly cookie via an API route
      await setTokenCookie(await user.getIdToken());
      
      // Redirect to admin dashboard on success
      router.push('/admin');

    } catch (err: any) {
      setIsPending(false);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Ungültige Anmeldedaten oder der Agentur-Benutzer ist nicht in Firebase Auth eingerichtet.');
          break;
        default:
          setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
          break;
      }
      console.error(err);
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
            <div className="mb-4 text-center">
              <CardTitle className="font-headline text-2xl font-bold">
                Agentur-Login
              </CardTitle>
              <CardDescription className="mt-1">
                Melden Sie sich an, um Ihre Hotels zu verwalten.
              </CardDescription>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agency-email">E-Mail</Label>
              <Input
                id="agency-email"
                name="email"
                type="email"
                placeholder="Ihre E-Mail"
                required
                className="h-12 text-base"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="agency-password">Passwort</Label>
              <Input
                id="agency-password"
                name="password"
                type="password"
                required
                placeholder='Ihr Passwort'
                className="h-12 text-base"
                autoComplete="current-password"
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
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
                disabled={isPending}
              >
                 {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Anmelden
              </Button>
              <Button
                asChild
                variant="link"
                size="sm"
                className="font-normal text-muted-foreground hover:text-primary"
              >
                <Link href="/">Zurück zur Auswahl</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
