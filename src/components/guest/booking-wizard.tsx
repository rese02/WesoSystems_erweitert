'use client';

import { useState, useActionState } from 'react';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, AlertCircle, CalendarIcon, Loader2 } from 'lucide-react';
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


const steps = ['Gast', 'Mitreiser', 'Zahlung', 'Prüfung'];

type BookingWizardProps = {
  linkId: string;
  initialData: GuestLinkData;
};

export function BookingWizard({ linkId, initialData }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fellowTravelers, setFellowTravelers] = useState([{ id: 1, name: '' }]);
  const [uploadChoice, setUploadChoice] = useState('later');
  const [birthDate, setBirthDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    firstName: initialData.booking.guestName.split(' ')[0] || '',
    lastName: initialData.booking.guestName.split(' ').slice(1).join(' ') || '',
    email: '',
    phone: '',
    street: '',
    zip: '',
    city: '',
    specialRequests: ''
  });
  
  const [formState, formAction, isPending] = useActionState(
    finalizeBookingAction.bind(null, linkId),
    { message: '', errors: null, isValid: true }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTraveler = () => {
    setFellowTravelers([...fellowTravelers, { id: Date.now(), name: '' }]);
  };

  const removeTraveler = (id: number) => {
    setFellowTravelers(fellowTravelers.filter((t) => t.id !== id));
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
                        <Label htmlFor="firstName">Vorname</Label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Nachname</Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="street">Straße und Hausnummer</Label>
                        <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="zip">Postleitzahl</Label>
                        <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="city">Stadt</Label>
                        <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                    </div>
                     <div className="grid gap-2">
                        <Label>Geburtsdatum (optional, mind. 18)</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={'outline'}
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !birthDate && 'text-muted-foreground'
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {birthDate ? format(birthDate, 'dd.MM.yyyy') : <span>Datum auswählen</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={birthDate}
                                onSelect={setBirthDate}
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
                            <Label>Ausweisdokument (Vorderseite)</Label>
                            <FileUpload />
                             <p className="text-xs text-muted-foreground">JPG, PNG, PDF (max 5MB). Bilder werden komprimiert.</p>
                        </div>
                         <div className="grid gap-2">
                            <Label>Ausweisdokument (Rückseite)</Label>
                            <FileUpload />
                             <p className="text-xs text-muted-foreground">JPG, PNG, PDF (max 5MB). Bilder werden komprimiert.</p>
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
               <CardDescription>Tragen Sie hier die Namen aller Mitreisenden ein.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fellowTravelers.map((traveler) => (
                <div key={traveler.id} className="flex items-end gap-2">
                  <div className="flex-grow">
                    <Label>Vor- und Nachname</Label>
                    <Input placeholder="Erika Mustermann" />
                  </div>
                  {fellowTravelers.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTraveler(traveler.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
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
               <CardDescription>Hier finden Sie die Bankdaten für die Überweisung. Laden Sie anschließend eine Bestätigung hoch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card className="bg-muted/50">
                    <CardHeader><CardTitle className="text-base">Bankdaten des Hotels</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Inhaber:</strong> {initialData.hotel.bankDetails.accountHolder}</p>
                        <p><strong>IBAN:</strong> {initialData.hotel.bankDetails.iban}</p>
                        <p><strong>BIC:</strong> {initialData.hotel.bankDetails.bic}</p>
                        <p><strong>Bank:</strong> {initialData.hotel.bankDetails.bankName}</p>
                    </CardContent>
                </Card>
              <div>
                <Label className="mb-2 block font-medium">Zahlungsbeleg hochladen</Label>
                <FileUpload />
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
                <input type="hidden" name="birthDate" value={birthDate ? format(birthDate, 'yyyy-MM-dd') : ''} />
                <input type="hidden" name="street" value={formData.street} />
                <input type="hidden" name="zip" value={formData.zip} />
                <input type="hidden" name="city" value={formData.city} />
                <input type="hidden" name="specialRequests" value={formData.specialRequests} />


                <div className="flex items-center space-x-2">
                  <Checkbox id="agb" required />
                  <label htmlFor="agb" className="text-sm">
                    Ich stimme den Allgemeinen Geschäftsbedingungen zu.
                  </label>
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
                <Button type="submit" disabled={isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                className={currentStep === 0 ? 'invisible' : ''}
            >
              Zurück
            </Button>
          
          <Button onClick={() => setCurrentStep(currentStep + 1)} className="bg-primary hover:bg-primary/90">
            Weiter
          </Button>
        </div>
      )}
    </div>
  );
}
