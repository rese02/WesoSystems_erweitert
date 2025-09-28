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
import { useState, useActionState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { loginAgencyAction } from '@/actions/agency-actions';

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

const initialState = {
  message: '',
  success: false,
};

export default function AgencyLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAgencyAction, initialState);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // This effect handles the successful server-side validation
    if (state.success) {
      const performFirebaseLogin = async () => {
        const email = process.env.NEXT_PUBLIC_AGENCY_EMAIL;
        const password = process.env.NEXT_PUBLIC_AGENCY_PASSWORD;

        if (!email || !password) {
          setFormError('Client-side Firebase credentials are not configured.');
          return;
        }

        try {
          // Sign in to Firebase on the client to get an ID token
          const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
          const token = await userCredential.user.getIdToken();
          
          // Send the token to the server to be set as an httpOnly cookie
          const cookieSet = await setTokenCookie(token);
          
          if (cookieSet) {
            router.push('/admin');
          } else {
            setFormError('Failed to set authentication session. Please try again.');
          }
        } catch (error) {
          console.error("Firebase login failed on client:", error);
          setFormError('Authentication with Firebase services failed.');
        }
      };

      performFirebaseLogin();
    }
  }, [state.success, state.message, router]);

  const displayError = formError || (state.message && !state.success ? state.message : null);

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm rounded-2xl border-none bg-white/80 p-8 shadow-lg backdrop-blur-sm">
        <CardHeader className="items-center p-0 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
            <MountainIcon className="h-6 w-6 text-gray-600" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <form action={formAction} className="grid gap-4">
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
              />
            </div>
            
             {displayError && (
                   <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fehler</AlertTitle>
                      <AlertDescription>{displayError}</AlertDescription>
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
