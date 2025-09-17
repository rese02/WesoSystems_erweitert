'use client';

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

// This is a placeholder page. In a real application, you would fetch
// the hotel data and use it to pre-fill the form fields.
// For example, using a server action and `useState` or a form library like `react-hook-form`.

export default function HotelSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Einstellungen</h1>
        <p className="mt-1 text-muted-foreground">
          Verwalten Sie die Stammdaten und Konfigurationen Ihres Hotels.
        </p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Basisinformationen</CardTitle>
            <CardDescription>
              Allgemeine Informationen und öffentliche Kontaktdaten des Hotels.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="hotelName">Hotelname</Label>
              <Input id="hotelName" name="hotelName" placeholder="z.B. Ihr Hotel" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input id="domain" name="domain" placeholder="z.B. ihr-hotel.de" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Kontakt E-Mail</Label>
              <Input id="contactEmail" name="contactEmail" type="email" placeholder="info@ihr-hotel.de" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPhone">Kontakt Telefon</Label>
              <Input id="contactPhone" name="contactPhone" type="tel" placeholder="+49 123 456789" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bankverbindung für Überweisungen</CardTitle>
            <CardDescription>
              Diese Daten werden dem Gast für die Überweisung angezeigt.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="accountHolder">Kontoinhaber</Label>
              <Input id="accountHolder" name="accountHolder" placeholder="Ihr Name oder Firmenname" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" name="iban" placeholder="Ihre IBAN" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bic">BIC/SWIFT</Label>
              <Input id="bic" name="bic" placeholder="Ihr BIC/SWIFT" />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="bankName">Bank</Label>
              <Input id="bankName" name="bankName" placeholder="Name Ihrer Bank" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>E-Mail-Versand (SMTP)</CardTitle>
            <CardDescription>
              Damit das System in Ihrem Namen E-Mails versenden kann.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="smtpHost">Host</Label>
              <Input id="smtpHost" name="smtpHost" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtpPort">Port</Label>
              <Input id="smtpPort" name="smtpPort" type="number" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtpUser">E-Mail-Benutzer</Label>
              <Input id="smtpUser" name="smtpUser" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="smtpPass">App-Passwort</Label>
              <Input id="smtpPass" name="smtpPass" type="password" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button>Änderungen speichern</Button>
        </div>
      </div>
    </div>
  );
}
