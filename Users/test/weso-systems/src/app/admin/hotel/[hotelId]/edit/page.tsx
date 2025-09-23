'use client';
import { useActionState, useState, useEffect, useRef } from 'react';
import { updateHotelByAgencyAction } from '@/actions/hotel-actions';
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
import { PlusCircle, Trash2, KeyRound, AlertCircle, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { FileUpload } from '@/components/guest/file-upload';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { Hotel } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import Link from 'next/link';

const initialState = {
  message: '',
  success: false,
};

export default function EditHotelPage() {
  const router = useRouter();
  const params = useParams<{ hotelId: string }>();
  const hotelId = params.hotelId;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  const [roomCategories, setRoomCategories] = useState<string[]>([]);
  const [mealTypes, setMealTypes] = useState<Set<string>>(new Set());
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  
  const boundUpdateAction = updateHotelByAgencyAction.bind(null, hotelId);
  const [state, action, isPending] = useActionState(boundUpdateAction, initialState);

  useEffect(() => {
    if (!hotelId) return;
    const fetchHotel = async () => {
        const hotelRef = doc(db, 'hotels', hotelId);
        const hotelSnap = await getDoc(hotelRef);
        if (hotelSnap.exists()) {
            const data = hotelSnap.data() as Hotel;
            setHotel(data);
            setRoomCategories(data.bookingConfig.roomCategories || []);
            setMealTypes(new Set(data.bookingConfig.mealTypes || []));
            setLogoUrl(data.logoUrl || '');
        }
        setLoading(false);
    }
    fetchHotel();
  }, [hotelId]);
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Erfolgreich gespeichert' : 'Fehler',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        router.push('/admin');
      }
    }
  }, [state, toast, router]);


  const handleMealTypeChange = (meal: string, checked: boolean) => {
    setMealTypes(prev => {
        const newSet = new Set(prev);
        if (checked) {
            newSet.add(meal);
        } else {
            newSet.delete(meal);
        }
        return newSet;
    });
  }

  if (loading) {
      return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (!hotel) {
      return <div className="text-center">Hotel nicht gefunden.</div>
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <h1 className="font-headline text-3xl font-bold">
            Hotel bearbeiten: {hotel.hotelName}
            </h1>
            <p className="mt-1 text-muted-foreground">
            Passen Sie die Stammdaten und Konfigurationen dieses Hotels an.
            </p>
        </div>
      </div>

      <form action={action} className="grid gap-8 lg:grid-cols-3">
        <div className="grid gap-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basisinformationen & Branding</CardTitle>
              <CardDescription>
                Allgemeine Informationen und öffentliches Erscheinungsbild des Hotels.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="hotelName">Hotelname</Label>
                  <Input id="hotelName" name="hotelName" defaultValue={hotel.hotelName} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input id="domain" name="domain" defaultValue={hotel.domain} required />
                </div>
                 <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Kontakt E-Mail</Label>
                  <Input id="contactEmail" name="contactEmail" type="email" defaultValue={hotel.contact.email} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">Kontakt Telefon</Label>
                  <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={hotel.contact.phone} required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Hotel-Logo</Label>
                {logoUrl ? (
                   <div className='relative h-32 w-full rounded-md border p-2'>
                        <Image src={logoUrl} alt="Hotel Logo Vorschau" fill className="object-contain" />
                        <input type="hidden" name="logoUrl" value={logoUrl} />
                   </div>
                ) : (
                    <FileUpload 
                        bookingId="new-hotel-logo" 
                        fileType="logo"
                        uploadedFileUrl={null}
                        onUploadStart={() => setIsUploading(true)}
                        onUploadComplete={(type, url) => { setLogoUrl(url); setIsUploading(false); }}
                        onDelete={() => setLogoUrl('')}
                    />
                )}
                 <input type="hidden" name="logoUrl" value={logoUrl} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hotelier-Zugang & Berechtigungen</CardTitle>
              <CardDescription>
                Sie können das Passwort für den Hotelier zurücksetzen. Die E-Mail kann hier nicht geändert werden.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="hotelierEmail">E-Mail des Hoteliers (nicht änderbar)</Label>
                <Input
                  id="hotelierEmail"
                  name="hotelierEmail"
                  type="email"
                  defaultValue={hotel.hotelier.email}
                  disabled
                />
              </div>
               <div className="flex items-start space-x-3 rounded-md border p-4">
                  <Checkbox id="canEditBankDetails" name="canEditBankDetails" defaultChecked={hotel.permissions?.canEditBankDetails} />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="canEditBankDetails" className="flex items-center gap-2">
                       <ShieldCheck className="h-4 w-4" /> Hotelier darf Bankdaten bearbeiten
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Wenn aktiviert, kann der Hotelier die Bankverbindung in seinen Einstellungen selbst ändern.
                    </p>
                  </div>
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
                  defaultValue={hotel.bankDetails.accountHolder}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" name="iban" defaultValue={hotel.bankDetails.iban} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bic">BIC/SWIFT</Label>
                <Input
                  id="bic"
                  name="bic"
                  defaultValue={hotel.bankDetails.bic}
                  required
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="bankName">Bank</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  defaultValue={hotel.bankDetails.bankName}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>E-Mail-Versand (SMTP)</CardTitle>
                <CardDescription>Damit das System im Namen des Hotels E-Mails versenden kann. Lassen Sie das Passwortfeld leer, um das vorhandene zu behalten.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="smtpHost">Host</Label>
                    <Input id="smtpHost" name="smtpHost" defaultValue={hotel.smtp.host} required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="smtpPort">Port</Label>
                    <Input id="smtpPort" name="smtpPort" type="number" defaultValue={hotel.smtp.port} required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="smtpUser">E-Mail-Benutzer</Label>
                    <Input id="smtpUser" name="smtpUser" defaultValue={hotel.smtp.user} required/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="smtpPass">Neues App-Passwort</Label>
                    <Input id="smtpPass" name="smtpPass" placeholder="Leer lassen, um altes zu behalten" type="password"/>
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
                        {['Frühstück', 'Halbpension', 'Vollpension', 'Ohne Verpflegung'].map(meal => (
                             <div key={meal} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={meal.toLowerCase().replace(' ', '')} 
                                    name="mealTypes" 
                                    value={meal} 
                                    checked={mealTypes.has(meal)}
                                    onCheckedChange={(checked) => handleMealTypeChange(meal, !!checked)}
                                />
                                <Label htmlFor={meal.toLowerCase().replace(' ', '')}>{meal}</Label>
                            </div>
                        ))}
                    </div>
                    </div>

                    <div className="space-y-2">
                    <Label>Zimmerkategorien</Label>
                    {roomCategories.map((category, index) => (
                        <div key={index} className="flex items-center gap-2">
                        <Input
                            name="roomCategories"
                            defaultValue={category}
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
            <CardContent className="grid gap-2">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isPending || isUploading}
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Änderungen speichern
              </Button>
              <Button variant="outline" asChild>
                  <Link href="/admin">Abbrechen</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
