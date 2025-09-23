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
import { loginAgencyAction } from '@/actions/agency-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState = {
  message: '',
  success: false,
};

export default function AgencyLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAgencyAction, initialState);

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
            
             {state?.message && !state.success && (
                   <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fehler</AlertTitle>
                      <AlertDescription>{state.message}</AlertDescription>
                  </Alert>
              )}

            <div className="grid gap-3 pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
                disabled={isPending}
              >
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
