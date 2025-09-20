'use client';

import { useState, useActionState } from 'react';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, AlertCircle, CalendarIcon, Loader2, Copy, Check } from 'lucide-react';
import { FileUpload } from './file-upload';
import { finalizeBookingAction } from '@/actions/guest-actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { de } from 'date-fns/locale';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { GuestLinkData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


const steps = ['Gast', 'Mitreiser', 'Zahlung', 'Prüfung'];

type BookingWizardProps = {
  linkId: string;
  initialData: GuestLinkData;
};

type FellowTraveler = { id: number; name: string };

export function BookingWizard({ linkId, initialData }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: initialData.booking.guestName.split(' ')[0] || '',
    lastName: initialData.booking.guestName.split(' ').slice(1).join(' ') || '',
    email: '',
    phone: '',
    street: '',
    zip: '',
    city: '',
    birthDate: '',
    specialRequests: '',
  });

  const [documentUrls, setDocumentUrls] = useState({
    idFront: '',
    idBack: '',
    paymentProof: '',
  });
  
  const [uploadChoice, setUploadChoice] = useState('later');

  const totalGuests = initialData.booking.rooms.reduce((sum, room) => sum + room.adults + room.children, 0);
  const numberOfFellowTravelers = totalGuests > 1 ? totalGuests - 1 : 0;

  const [fellowTravelers, setFellowTravelers] = useState<FellowTraveler[]>(
    Array.from({ length: numberOfFellowTravelers }, (_, i) => ({ id: i + 1, name: '' }))
  );
  
  const [formState, formAction, isPending] = useActionState(
    finalizeBookingAction.bind(null, linkId),
    { message: '', errors: null, isValid: true }
  );

  const handleUploadComplete = (fileType: keyof typeof documentUrls, url: string) => {
    setDocumentUrls(prev => ({ ...prev, [fileType]: url }));
    setIsUploading(false);
  };
  
  const handleUploadStart = () => {
    setIsUploading(true);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTravelerNameChange = (id: number, name: string) => {
    setFellowTravelers(prev => prev.map(t => t.id === id ? { ...t, name } : t));
  };


  const addTraveler = () => {
    setFellowTravelers([...fellowTravelers, { id: Date.now(), name: '' }]);
  };

  const removeTraveler = (id: number) => {
    setFellowTravelers(fellowTravelers.filter((t) => t.id !== id));
  };

  const isStep1Valid = () => {
    const requiredFields = [formData.firstName, formData.lastName, formData.email, formData.phone, formData.street, formData.zip, formData.city];
    if (requiredFields.some(field => field.trim() === '')) return false;

    if (uploadChoice === 'now' && (!documentUrls.idFront || !documentUrls.idBack)) {
      return false; // Wenn Upload gewählt, müssen die Dokumente hochgeladen sein
    }
    return true;
  };

  const isStep2Valid = () => {
    return fellowTravelers.every(t => t.name.trim() !== '');
  };

  const isStep3Valid = () => {
    return !!documentUrls.paymentProof;
  };


  const isNextButtonDisabled = () => {
    if (isUploading) return true;
    switch (currentStep) {
      case 0:
        return !isStep1Valid();
      case 1:
        return !isStep2Valid();
      case 2:
        return !isStep3Valid();
      default:
        return false;
    }
  }

  const CopyToClipboardButton = ({ textToCopy, fieldName }: { textToCopy: string; fieldName: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({ title: `${fieldName} kopiert!`, description: `${textToCopy}` });
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <Button variant="ghost" size="icon" onClick={handleCopy} aria-label={`Kopiere ${fieldName}`}>
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    );
  };


  const StepContent = () => {
    switch (currentStep) {
      case 0: // Gast
        return (
          <Card>
            <CardHeader>
              <CardTitle>Ihre Kontaktdaten (Hauptbucher)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="firstName">Vorname <span className="text-destructive">*</span></Label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Nachname <span className="text-destructive">*</span></Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-Mail <span className="text-destructive">*</span></Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="phone">Telefon <span className="text-destructive">*</span></Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="street">Straße und Hausnummer <span className="text-destructive">*</span></Label>
                        <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="zip">Postleitzahl <span className="text-destructive">*</span></Label>
                        <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="city">Stadt <span className="text-destructive">*</span></Label>
                        <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="birthDate">Geburtsdatum (optional, mind. 18)</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={'outline'}
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !formData.birthDate && 'text-muted-foreground'
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.birthDate ? format(new Date(formData.birthDate), 'dd.MM.yyyy') : <span>Datum auswählen</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={formData.birthDate ? new Date(formData.birthDate) : undefined}
                                onSelect={(date) => setFormData(prev => ({...prev, birthDate: date ? format(date, 'yyyy-MM-dd') : ''}))}
                                captionLayout="dropdown-buttons"
                                fromYear={1920}
                                toYear={new Date().getFullYear() - 18}
                                initialFocus
                                locale={de}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Ausweisdokumente</Label>
                    <p className="text-sm text-muted-foreground">Bitte wählen Sie, wie Sie die Ausweisdokumente bereitstellen möchten.</p>
                    <RadioGroup defaultValue="later" onValueChange={setUploadChoice} className="flex gap-4 pt-2">
                        <Label htmlFor="upload-now" className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-4 hover:bg-muted/50 has-[input:checked]:border-primary has-[input:checked]:bg-muted/50">
                            <RadioGroupItem value="now" id="upload-now" />
                            Jetzt hochladen
                        </Label>
                        <Label htmlFor="upload-later" className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-4 hover:bg-muted/50 has-[input:checked]:border-primary has-[input:checked]:bg-muted/50">
                            <RadioGroupItem value="later" id="upload-later" />
                            Vor Ort vorzeigen
                        </Label>
                    </RadioGroup>
                </div>

                {uploadChoice === 'now' && (
                    <div className="space-y-4 rounded-md border p-4 animate-fade-in">
                        <div className="grid gap-2">
                            <Label>Ausweisdokument (Vorderseite) <span className="text-destructive">*</span></Label>
                            <FileUpload
                                bookingId={linkId}
                                fileType="idFront"
                                onUploadComplete={handleUploadComplete}
                                onUploadStart={handleUploadStart}
                            />
                             <p className="text-xs text-muted-foreground">JPG, PNG, PDF (max 5MB).</p>
                        </div>
                         <div className="grid gap-2">
                            <Label>Ausweisdokument (Rückseite) <span className="text-destructive">*</span></Label>
                             <FileUpload
                                bookingId={linkId}
                                fileType="idBack"
                                onUploadComplete={handleUploadComplete}
                                onUploadStart={handleUploadStart}
                            />
                             <p className="text-xs text-muted-foreground">JPG, PNG, PDF (max 5MB).</p>
                        </div>
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="specialRequests">Ihre Anmerkungen (optional)</Label>
                    <Textarea name="specialRequests" id="specialRequests" placeholder="Haben Sie besondere Wünsche oder Anmerkungen?" value={formData.specialRequests} onChange={handleInputChange} />
                </div>
            </CardContent>
          </Card>
        );
      case 1: // Mitreiser
        return (
          <Card>
            <CardHeader>
              <CardTitle>Mitreisende Personen</CardTitle>
               <CardDescription>
                Tragen Sie hier die Namen aller {numberOfFellowTravelers} Mitreisenden ein. Alle Felder sind Pflichtfelder.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fellowTravelers.length > 0 ? fellowTravelers.map((traveler, index) => (
                <div key={traveler.id} className="flex items-end gap-2">
                  <div className="flex-grow">
                    <Label htmlFor={`traveler-${traveler.id}`}>Mitreisender {index + 1}: Vor- und Nachname <span className="text-destructive">*</span></Label>
                    <Input 
                        id={`traveler-${traveler.id}`}
                        placeholder="Erika Mustermann" 
                        value={traveler.name}
                        onChange={(e) => handleTravelerNameChange(traveler.id, e.target.value)}
                        required
                    />
                  </div>
                  {fellowTravelers.length > numberOfFellowTravelers && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTraveler(traveler.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              )) : <p className="text-muted-foreground">Keine Mitreisenden für diese Buchung.</p>}
              <Button type="button" variant="outline" onClick={addTraveler}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Weitere Person hinzufügen
              </Button>
            </CardContent>
          </Card>
        );
      case 2: // Zahlung
        return (
          <Card>
            <CardHeader>
              <CardTitle>Zahlungsinformationen</CardTitle>
               <CardDescription>Hier finden Sie die Bankdaten für die Überweisung. Bitte laden Sie anschließend eine Bestätigung hoch, um fortzufahren.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card className="bg-muted/50">
                    <CardHeader><CardTitle className="text-base">Bankdaten des Hotels</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p><strong>Inhaber:</strong> {initialData.hotel.bankDetails.accountHolder}</p>
                            <CopyToClipboardButton textToCopy={initialData.hotel.bankDetails.accountHolder} fieldName="Kontoinhaber" />
                        </div>
                        <div className="flex items-center justify-between">
                             <p><strong>IBAN:</strong> {initialData.hotel.bankDetails.iban}</p>
                             <CopyToClipboardButton textToCopy={initialData.hotel.bankDetails.iban} fieldName="IBAN" />
                        </div>
                         <div className="flex items-center justify-between">
                            <p><strong>BIC:</strong> {initialData.hotel.bankDetails.bic}</p>
                            <CopyToClipboardButton textToCopy={initialData.hotel.bankDetails.bic} fieldName="BIC" />
                        </div>
                         <div className="flex items-center justify-between">
                            <p><strong>Bank:</strong> {initialData.hotel.bankDetails.bankName}</p>
                            <CopyToClipboardButton textToCopy={initialData.hotel.bankDetails.bankName} fieldName="Bank" />
                        </div>
                    </CardContent>
                </Card>
              <div>
                <Label className="mb-2 block font-medium">Zahlungsbeleg hochladen <span className="text-destructive">*</span></Label>
                <FileUpload
                    bookingId={linkId}
                    fileType="paymentProof"
                    onUploadComplete={handleUploadComplete}
                    onUploadStart={handleUploadStart}
                />
                <p className="text-xs text-muted-foreground mt-2">Ein Zahlungsnachweis ist erforderlich, um fortzufahren.</p>
              </div>
            </CardContent>
          </Card>
        );
      case 3: // Prüfung
        return (
          <form action={formAction}>
            <Card>
              <CardHeader>
                <CardTitle>Prüfung und Abschluss</CardTitle>
                <CardDescription>
                  Bitte überprüfen Sie alle Ihre Angaben. Mit dem Absenden der
                  Daten schließen Sie Ihre Buchung verbindlich ab.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
               
                {/* Hidden fields for data submission */}
                <input type="hidden" name="firstName" value={formData.firstName} />
                <input type="hidden" name="lastName" value={formData.lastName} />
                <input type="hidden" name="email" value={formData.email} />
                <input type="hidden" name="phone" value={formData.phone} />
                <input type="hidden" name="birthDate" value={formData.birthDate} />
                <input type="hidden" name="street" value={formData.street} />
                <input type="hidden" name="zip" value={formData.zip} />
                <input type="hidden" name="city" value={formData.city} />
                <input type="hidden" name="specialRequests" value={formData.specialRequests} />
                {fellowTravelers.map((t, i) => (
                     <input key={t.id} type="hidden" name={`fellowTraveler_${i}`} value={t.name} />
                ))}
                 <input type="hidden" name="idFrontUrl" value={documentUrls.idFront} />
                 <input type="hidden" name="idBackUrl" value={documentUrls.idBack} />
                 <input type="hidden" name="paymentProofUrl" value={documentUrls.paymentProof} />


                <div className="flex items-start space-x-2">
                  <Checkbox id="agb" required />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="agb" className="text-sm font-medium">
                      Ich stimme den Allgemeinen Geschäftsbedingungen zu.
                    </label>
                     <p className="text-sm text-muted-foreground">
                      Mit dem Klick bestätigen Sie die Richtigkeit Ihrer Angaben.
                    </p>
                  </div>
                </div>
                 {formState?.errors && (
                    <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Fehler bei der Validierung</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                        {formState.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                        ))}
                        </ul>
                    </AlertDescription>
                    </Alert>
                )}
                 {formState?.message && !formState.isValid && (
                    <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Fehler</AlertTitle>
                    <AlertDescription>{formState.message}</AlertDescription>
                    </Alert>
                )}
                <Button type="submit" disabled={isPending || isUploading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {(isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Daten absenden & Buchung abschließen
              </Button>
              </CardContent>
            </Card>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center pt-4 pb-12">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="animate-fade-in">{StepContent()}</div>

      {currentStep < 3 && (
        <div className="flex justify-between gap-4">
            <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                className={cn(currentStep === 0 && 'invisible')}
            >
              Zurück
            </Button>
          
          <Button 
            onClick={() => setCurrentStep(currentStep + 1)} 
            className="bg-primary hover:bg-primary/90"
            disabled={isNextButtonDisabled()}
            >
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isUploading ? 'Lädt hoch...' : 'Weiter'}
          </Button>
        </div>
      )}
    </div>
  );
}

    