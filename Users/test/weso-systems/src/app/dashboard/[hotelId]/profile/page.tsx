'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateHotelierProfileAction, updateHotelLogo } from '@/actions/hotel-actions';
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
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Hotel } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/guest/file-upload';

const initialState = {
  message: '',
  success: false,
};

export default function HotelierProfilePage() {
  const params = useParams<{ hotelId: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const updateAction = updateHotelierProfileAction.bind(null, params.hotelId);
  const [state, formAction, isPending] = useActionState(updateAction, initialState);

  useEffect(() => {
    if (!params.hotelId) return;
    const hotelRef = doc(db, 'hotels', params.hotelId);
    const unsubscribe = onSnapshot(hotelRef, (doc) => {
        if (doc.exists()) {
            setHotel({ id: doc.id, ...doc.data() } as Hotel);
        }
    });
    return () => unsubscribe();
  }, [params.hotelId]);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Erfolg' : 'Fehler',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
    }
  }, [state, toast]);

  if (!hotel) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  }

  const handleLogoUpload = async (fileType: string, url: string) => {
    setIsUploading(false);
    if (hotel) {
        const result = await updateHotelLogo(hotel.id, url);
        if (result.success) {
            toast({ title: 'Logo aktualisiert!' });
        } else {
             toast({ title: 'Fehler', description: result.message, variant: 'destructive'});
        }
    }
  };
  
  const handleLogoDelete = async () => {
    if (hotel) {
        const result = await updateHotelLogo(hotel.id, '');
        if (result.success) {
            toast({ title: 'Logo entfernt.'});
        } else {
             toast({ title: 'Fehler', description: result.message, variant: 'destructive'});
        }
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Mein Hotel-Profil</h1>
        <p className="mt-1 text-muted-foreground">
          Verwalten Sie Ihr Logo und Ihre Zugangsdaten.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="items-center">
                <CardTitle>Hotel Logo</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <Avatar className="relative mx-auto h-32 w-32 rounded-full border">
                   {hotel.logoUrl ? (
                        <AvatarImage src={hotel.logoUrl} alt="Hotel Logo" className="object-contain p-2"/>
                   ) : (
                        <AvatarFallback className="text-4xl bg-muted">{hotel.hotelName.charAt(0)}</AvatarFallback>
                   )}
                </Avatar>
                <FileUpload 
                    bookingId={hotel.id}
                    fileType="logo"
                    uploadedFileUrl={hotel.logoUrl || null}
                    onUploadStart={() => setIsUploading(true)}
                    onUploadComplete={handleLogoUpload}
                    onDelete={handleLogoDelete}
                />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Zugangsdaten</CardTitle>
              <CardDescription>
                Ändern Sie Ihre E-Mail-Adresse und Ihr Passwort.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" name="email" type="email" defaultValue={hotel.hotelier.email} required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passwort ändern</CardTitle>
              <CardDescription>
                Lassen Sie die Felder leer, um das aktuelle Passwort beizubehalten.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">Neues Passwort</Label>
                <Input id="new-password" name="new-password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Neues Passwort bestätigen</Label>
                <Input id="confirm-password" name="confirm-password" type="password" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || isUploading}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Änderungen speichern
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
