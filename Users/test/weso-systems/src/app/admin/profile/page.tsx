'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Separator } from '@/components/ui/separator';

// Note: This is currently a mock page.
// The form doesn't do anything yet.

export default function AgencyProfilePage() {
  const agencyEmail = process.env.NEXT_PUBLIC_AGENCY_EMAIL || 'agentur@weso.it';

  return (
     <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Agenturprofil</h1>
        <p className="mt-1 text-muted-foreground">
          Verwalten Sie Ihre globalen Agentur-Einstellungen.
        </p>
      </div>

      <Separator />

      <form className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 border">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">A</AvatarFallback>
              </Avatar>
               <CardTitle className="pt-2">WesoSystems</CardTitle>
               <CardDescription>{agencyEmail}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-8 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Passwort ändern</CardTitle>
              <CardDescription>
                Lassen Sie die Felder leer, um das aktuelle Passwort beizubehalten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid gap-2">
                <Label htmlFor="current-password">Aktuelles Passwort</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">Neues Passwort</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Neues Passwort bestätigen</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button disabled>Änderungen speichern</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
