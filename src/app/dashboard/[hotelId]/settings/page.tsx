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
import { db } from '@/lib/firebase/client';
import { Hotel } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HotelSettingsPage() {
  const params = useParams<{ hotelId: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotel() {
      if (params.hotelId) {
        const hotelRef = doc(db, 'hotels', params.hotelId);
        const hotelSnap = await getDoc(hotelRef);
        if (hotelSnap.exists()) {
          setHotel({ id: hotelSnap.id, ...hotelSnap.data() } as Hotel);
        }
        setLoading(false);
      }
    }
    fetchHotel();
  }, [params.hotelId]);

  if (loading || !hotel) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const canEditBankDetails = hotel.permissions?.canEditBankDetails ?? false;

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
              <Input id="hotelName" name="hotelName" defaultValue={hotel.hotelName} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input id="domain" name="domain" defaultValue={hotel.domain} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Kontakt E-Mail</Label>
              <Input id="contactEmail" name="contactEmail" type="email" defaultValue={hotel.contact.email} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPhone">Kontakt Telefon</Label>
              <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={hotel.contact.phone} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bankverbindung für Überweisungen</CardTitle>
            <CardDescription>
              Diese Daten werden dem Gast für die Überweisung angezeigt. {!canEditBankDetails && "Nur die Agentur kann diese Daten ändern."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="accountHolder">Kontoinhaber</Label>
              <Input id="accountHolder" name="accountHolder" defaultValue={hotel.bankDetails.accountHolder} disabled={!canEditBankDetails}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" name="iban" defaultValue={hotel.bankDetails.iban} disabled={!canEditBankDetails}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bic">BIC/SWIFT</Label>
              <Input id="bic" name="bic" defaultValue={hotel.bankDetails.bic} disabled={!canEditBankDetails}/>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="bankName">Bank</Label>
              <Input id="bankName" name="bankName" defaultValue={hotel.bankDetails.bankName} disabled={!canEditBankDetails}/>
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
