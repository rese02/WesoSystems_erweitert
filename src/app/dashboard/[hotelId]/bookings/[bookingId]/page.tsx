
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/firebase/client';
import { Booking } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  Home,
  Users,
  FileText,
  Eye,
  MailCheck,
  FileX2,
  ShieldCheck,
  Badge,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

async function getBooking(hotelId: string, bookingId: string): Promise<Booking> {
  const bookingRef = doc(db, 'hotels', hotelId, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);

  if (!bookingSnap.exists()) {
    notFound();
  }
  
  const data = bookingSnap.data();

  // Convert Timestamps to serializable dates
  const checkIn = data.checkIn?.toDate() || new Date();
  const checkOut = data.checkOut?.toDate() || new Date();
  const createdAt = data.createdAt?.toDate() || new Date();

  return { 
      ...data, 
      id: bookingSnap.id,
      hotelId: hotelId,
      checkIn: checkIn,
      checkOut: checkOut,
      createdAt: createdAt,
      guestDetails: data.guestDetails || null,
      idUploadRequirement: data.idUploadRequirement || 'choice', // Fallback
  } as Booking;
}

const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : date.toDate();
    return format(d, 'dd. MMMM yyyy', { locale: de });
};

const DocumentLink = ({ url, label }: { url?: string; label: string }) => {
    if (!url) {
        return (
             <div className="flex items-center justify-between rounded-md border p-3 opacity-50">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground"/>
                    <span className="font-medium">{label}</span>
                </div>
                <Button variant="outline" size="sm" disabled>Nicht vorhanden</Button>
            </div>
        )
    }

    return (
         <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground"/>
                <span className="font-medium">{label}</span>
            </div>
            <Button asChild variant="outline" size="sm">
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <Eye className="mr-2 h-4 w-4"/> Ansehen
                </a>
            </Button>
        </div>
    )
}

export default async function BookingDetailsPage({ params }: { params: { hotelId: string, bookingId: string } }) {
  
  const booking = await getBooking(params.hotelId, params.bookingId);
  const guest = booking.guestDetails;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href={`/dashboard/${params.hotelId}/bookings`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
            <h1 className="font-headline text-3xl font-bold">Buchungsdetails</h1>
            <p className="text-muted-foreground">Buchungs-ID: {booking.id.substring(0,8).toUpperCase()}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Buchungsübersicht</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground"/>
                        <div>
                            <p className="text-sm font-medium">Check-in</p>
                            <p className="text-muted-foreground">{formatDate(booking.checkIn)}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground"/>
                        <div>
                            <p className="text-sm font-medium">Check-out</p>
                            <p className="text-muted-foreground">{formatDate(booking.checkOut)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Status</p>
                        <p className="font-semibold text-primary">{booking.status}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Gesamtpreis</p>
                        <p className="font-semibold text-primary">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(booking.price)}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Gastinformationen</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {guest ? (
                         <div className="grid gap-6 sm:grid-cols-2">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-medium">{guest.firstName} {guest.lastName}</p>
                                    <p className="text-sm text-muted-foreground">Hauptgast</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-medium">{guest.email}</p>
                                    <p className="text-sm text-muted-foreground">E-Mail</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-medium">{guest.phone || 'Nicht angegeben'}</p>
                                    <p className="text-sm text-muted-foreground">Telefon</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Home className="h-5 w-5 mt-1 text-muted-foreground"/>
                                <div>
                                    <p className="font-medium">{guest.street}</p>
                                    <p className="font-medium">{guest.zip} {guest.city}</p>
                                    <p className="text-sm text-muted-foreground">Adresse</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Gast hat seine Daten noch nicht übermittelt.</p>
                    )}
                   
                </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle>Mitreisende</CardTitle></CardHeader>
                <CardContent>
                     {guest && guest.fellowTravelers?.length > 0 ? (
                        <ul className="space-y-6">
                        {guest.fellowTravelers.map((t, i) => (
                             <li key={i} className="rounded-md border p-4">
                                <div className='flex items-center justify-between'>
                                     <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-muted-foreground"/>
                                        <span className='font-medium'>{t.name}</span>
                                    </div>
                                    <Badge variant="outline" className='flex items-center gap-2'>
                                        <ShieldCheck className='h-4 w-4 text-green-600'/>
                                        Dokumente vorhanden
                                    </Badge>
                                </div>
                                <Separator className='my-4'/>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <DocumentLink url={t.idFrontUrl} label="Ausweis (Vorderseite)" />
                                    <DocumentLink url={t.idBackUrl} label="Ausweis (Rückseite)" />
                                </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">Keine Mitreisenden angegeben oder keine Dokumente hochgeladen.</p>
                    )}
                </CardContent>
            </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-8 lg:col-span-1">
            <Card>
                <CardHeader><CardTitle>Dokumente des Hauptgastes</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <DocumentLink url={guest?.documentUrls?.paymentProof} label="Zahlungsbeleg" />
                    <DocumentLink url={guest?.documentUrls?.idFront} label="Ausweis (Vorderseite)" />
                    <DocumentLink url={guest?.documentUrls?.idBack} label="Ausweis (Rückseite)" />
                </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle>Interne Notizen</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground italic">
                        {booking.internalNotes || "Keine internen Notizen für diese Buchung vorhanden."}
                    </p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle>Aktionen</CardTitle></CardHeader>
                <CardContent className="grid gap-2">
                   <Button variant="outline"><MailCheck className="mr-2 h-4 w-4"/>Bestätigung erneut senden</Button>
                   <Button variant="destructive" className="bg-red-600 hover:bg-red-700"><FileX2 className="mr-2 h-4 w-4"/>Buchung stornieren</Button>
                </CardContent>
            </Card>

        </div>

      </div>
    </div>
  );
}
