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
import { AlertCircle, MountainIcon } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { loginHotelAction } from '@/actions/auth-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const initialState = {
  message: '',
  success: false,
};

export default function HotelLoginPage() {
  const [state, formAction] = useActionState(loginHotelAction, initialState);

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
              <div className="text-center mb-4">
              <CardTitle className="font-headline text-2xl font-bold">
                  Hotel-Login
              </CardTitle>
              <CardDescription className="mt-1">
                  Melden Sie sich bei Ihrem Hotel-Dashboard an.
              </CardDescription>
              </div>
              <div className="grid gap-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ihre E-Mail"
                  required
                  className="h-12 text-base"
                  autoComplete="off"
              />
              </div>
              <div className="grid gap-2">
              <Label htmlFor="password">Passwort</Label>
              <Input id="password" name="password" type="password" required className="h-12 text-base" autoComplete="off" placeholder="Ihr Passwort"/>
              </div>

              {state?.message && !state.success && (
                   <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fehler</AlertTitle>
                      <AlertDescription>{state.message}</AlertDescription>
                  </Alert>
              )}

              <div className="grid gap-3 pt-4">
                  <Button type="submit" size="lg" className="w-full h-12 bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95">
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
