'use client';
import { useActionState, useState } from 'react';
import { createHotelAction } from '@/actions/hotel-actions';
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
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2 } from 'lucide-react';

export default function CreateHotelPage() {
  const [roomCategories, setRoomCategories] = useState<string[]>([
    'Einzelzimmer',
    'Doppelzimmer',
  ]);
  const [mealTypes, setMealTypes] = useState({
    fruehstueck: true,
    halbpension: false,
    vollpension: false,
    ohne: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [state, action] = useActionState(createHotelAction, { message: '' });

  const handleFormSubmit = (formData: FormData) => {
    // Append dynamic data to formData before submitting
    roomCategories.forEach(cat => formData.append('roomCategories', cat));
    Object.entries(mealTypes).forEach(([key, value]) => {
      if (value) {
        formData.append('mealTypes', key);
      }
    });
    action(formData);
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Neues Hotel-System anlegen
        </h1>
        <p className="mt-1 text-muted-foreground">
          Setzen Sie ein komplettes, eigenständiges System für einen neuen
          Hotelkunden auf.
        </p>
      </div>

      <form action={handleFormSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="grid gap-8 lg:col-span-2">
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
                <Input
                  id="hotelName"
                  name="hotelName"
                  placeholder="z.B. Hotel Hatzis"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  name="domain"
                  placeholder="z.B. hatzis.com"
                  required
                />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="contactEmail">Kontakt E-Mail</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="info@hotel.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Kontakt Telefon</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="+49 123 456789"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hotelier-Zugang</CardTitle>
              <CardDescription>
                Erstellen Sie den initialen Benutzeraccount für den Hotelier. Das Passwort wird per E-Mail gesetzt.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hotelierEmail">E-Mail des Hoteliers</Label>
                <Input
                  id="hotelierEmail"
                  name="hotelierEmail"
                  type="email"
                  placeholder="hotelier@example.com"
                  required
                />
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
                <Input
                  id="accountHolder"
                  name="accountHolder"
                  placeholder="Ihr Name oder Firmenname"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" name="iban" placeholder="Ihre IBAN" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bic">BIC/SWIFT</Label>
                <Input
                  id="bic"
                  name="bic"
                  placeholder="Ihr BIC/SWIFT"
                  required
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="bankName">Bank</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  placeholder="Name Ihrer Bank"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>E-Mail-Versand (SMTP)</CardTitle>
                <CardDescription>Damit das System im Namen des Hotels E-Mails versenden kann.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="smtpHost">Host</Label>
                    <Input id="smtpHost" name="smtpHost" defaultValue="smtp.gmail.com" required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="smtpPort">Port</Label>
                    <Input id="smtpPort" name="smtpPort" type="number" defaultValue="587" required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="smtpUser">E-Mail-Benutzer</Label>
                    <Input id="smtpUser" name="smtpUser" placeholder="z.B. info@hotel-sonne.com" required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="smtpPass">App-Passwort</Label>
                    <Input id="smtpPass" name="smtpPass" placeholder="Gmail App-Passwort eingeben" type="password" required/>
                </div>
            </CardContent>
          </Card>

           <Card>
                <CardHeader>
                    <CardTitle>Buchungskonfiguration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                    <Label>Verpflegungsarten</Label>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="fruehstueck" checked={mealTypes.fruehstueck} onCheckedChange={(checked) => setMealTypes(prev => ({...prev, fruehstueck: !!checked}))} />
                            <Label htmlFor="fruehstueck">Frühstück</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="halbpension" checked={mealTypes.halbpension} onCheckedChange={(checked) => setMealTypes(prev => ({...prev, halbpension: !!checked}))} />
                            <Label htmlFor="halbpension">Halbpension</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="vollpension" checked={mealTypes.vollpension} onCheckedChange={(checked) => setMealTypes(prev => ({...prev, vollpension: !!checked}))} />
                            <Label htmlFor="vollpension">Vollpension</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Checkbox id="ohne" checked={mealTypes.ohne} onCheckedChange={(checked) => setMealTypes(prev => ({...prev, ohne: !!checked}))} />
                            <Label htmlFor="ohne">Ohne Verpflegung</Label>
                        </div>
                    </div>
                    </div>

                    <div className="space-y-2">
                    <Label>Zimmerkategorien</Label>
                    {roomCategories.map((category, index) => (
                        <div key={index} className="flex items-center gap-2">
                        <Input 
                            value={category}
                            onChange={(e) => {
                                const newCategories = [...roomCategories];
                                newCategories[index] = e.target.value;
                                setRoomCategories(newCategories);
                            }}
                        />
                        {roomCategories.length > 1 && (
                            <Button type="button" variant="outline" size="icon" onClick={() => setRoomCategories(roomCategories.filter((_, i) => i !== index))}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => setRoomCategories([...roomCategories, 'Neue Kategorie'])}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Zimmerkategorie hinzufügen
                    </Button>
                    </div>
                </CardContent>
            </Card>

        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Aktionen</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Hotel erstellen
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
