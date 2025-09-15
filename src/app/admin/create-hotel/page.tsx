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

export default function CreateHotelPage() {
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

      <form action={createHotelAction} className="grid gap-8 lg:grid-cols-3">
        <div className="grid gap-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basisinformationen</CardTitle>
              <CardDescription>
                Allgemeine Informationen über das Hotel.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hotelier-Zugang</CardTitle>
              <CardDescription>
                Erstellen Sie den initialen Benutzeraccount für den Hotelier.
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
              <CardTitle>Kontaktdaten</CardTitle>
              <CardDescription>
                Wie können Gäste oder die Agentur das Hotel erreichen?
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Kontakt E-Mail</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  placeholder="info@hotel.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Kontakt Telefon</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="+49 123 456789"
                />
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
