'use client';

import { useState, useActionState, useMemo, Fragment } from 'react';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CalendarIcon, Loader2, Copy, Check } from 'lucide-react';
import { FileUpload } from './file-upload';
import { finalizeBookingAction } from '@/actions/guest-actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { de, en, it } from 'date-fns/locale';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { GuestLinkData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const locales = {
  de: de,
  en: en,
  it: it,
};

type TranslationKey = 
  | 'steps' | 'mainGuestTitle' | 'firstNameLabel' | 'lastNameLabel' | 'emailLabel' | 'phoneLabel' 
  | 'streetLabel' | 'zipLabel' | 'cityLabel' | 'birthDateLabel' | 'selectDate' | 'idDocsLabel' 
  | 'idDocsDescription' | 'idDocsDescriptionRequired' | 'uploadNow' | 'uploadLater' | 'idFrontLabel' 
  | 'idBackLabel' | 'fileTypeHint' | 'notesLabel' | 'notesPlaceholder' | 'fellowTravelersTitle' 
  | 'fellowTravelersDescription' | 'fellowTravelerLabel' | 'fellowTravelerPlaceholder' | 'noFellowTravelers' 
  | 'addPerson' | 'paymentOptionTitle' | 'paymentOptionDescription' | 'depositLabel' | 'fullPaymentLabel' 
  | 'paymentDetailsTitle' | 'paymentDetailsDescription' | 'hotelBankDetails' | 'amountToPay' 
  | 'accountHolder' | 'iban' | 'bic' | 'bank' | 'uploadProofLabel' | 'uploadProofDescription' 
  | 'reviewTitle' | 'reviewDescription' | 'agb' | 'agbHint' | 'validationErrorTitle' 
  | 'serverErrorTitle' | 'submitButton' | 'backButton' | 'nextButton' | 'uploading' 
  | 'requiredField' | 'copyToastTitle' | 'infantsTitle' | 'infantsDescription' | 'infantLabel';


const t = (lang: 'de' | 'en' | 'it', key: TranslationKey, ...args: any[]): string | string[] => {
    const translations = {
    de: {
        steps: ['Gast', 'Mitreiser', 'Zahlung', 'Details', 'Prüfung'],
        mainGuestTitle: "Ihre Kontaktdaten (Hauptbucher)",
        firstNameLabel: "Vorname",
        lastNameLabel: "Nachname",
        emailLabel: "E-Mail",
        phoneLabel: "Telefon",
        streetLabel: "Straße und Hausnummer",
        zipLabel: "Postleitzahl",
        cityLabel: "Stadt",
        birthDateLabel: "Geburtsdatum (optional, mind. 18)",
        selectDate: "Datum auswählen",
        idDocsLabel: "Ausweisdokumente",
        idDocsDescription: "Bitte wählen Sie, wie Sie die Ausweisdokumente bereitstellen möchten.",
        idDocsDescriptionRequired: "Das Hochladen Ihrer Ausweisdokumente ist für diese Buchung erforderlich.",
        uploadNow: "Jetzt hochladen",
        uploadLater: "Vor Ort vorzeigen",
        idFrontLabel: "Ausweisdokument (Vorderseite)",
        idBackLabel: "Ausweisdokument (Rückseite)",
        fileTypeHint: "JPG, PNG, PDF (max 5MB).",
        notesLabel: "Ihre Anmerkungen (optional)",
        notesPlaceholder: "Haben Sie besondere Wünsche oder Anmerkungen?",
        fellowTravelersTitle: "Mitreisende Personen (Erwachsene & Kinder)",
        fellowTravelersDescription: (count: number) => `Tragen Sie hier die Namen aller ${count} Mitreisenden ein.`,
        fellowTravelerLabel: (index: number) => `Mitreisender ${index + 1}: Vor- und Nachname`,
        fellowTravelerPlaceholder: "Vor- und Nachname",
        noFellowTravelers: "Keine Mitreisenden für diese Buchung.",
        addPerson: "Weitere Person hinzufügen",
        paymentOptionTitle: "Zahlungsoption wählen",
        paymentOptionDescription: "Sie haben die Wahl, eine Anzahlung zu leisten oder den Gesamtbetrag sofort zu begleichen.",
        depositLabel: "30% Anzahlung leisten",
        fullPaymentLabel: "100% Vorauszahlung",
        paymentDetailsTitle: "Zahlungsdetails",
        paymentDetailsDescription: "Hier finden Sie die Bankdaten für die Überweisung. Bitte laden Sie anschließend eine Bestätigung hoch, um fortzufahren.",
        hotelBankDetails: "Bankdaten des Hotels",
        amountToPay: "Zu zahlender Betrag",
        accountHolder: "Inhaber",
        iban: "IBAN",
        bic: "BIC",
        bank: "Bank",
        uploadProofLabel: "Zahlungsbeleg hochladen",
        uploadProofDescription: "Ein Zahlungsnachweis ist erforderlich, um fortzufahren.",
        reviewTitle: "Prüfung und Abschluss",
        reviewDescription: "Bitte überprüfen Sie alle Ihre Angaben. Mit dem Absenden der Daten schließen Sie Ihre Buchung verbindlich ab.",
        agb: "Ich stimme den Allgemeinen Geschäftsbedingungen zu.",
        agbHint: "Mit dem Klick bestätigen Sie die Richtigkeit Ihrer Angaben.",
        validationErrorTitle: "Fehler bei der Validierung",
        serverErrorTitle: "Fehler",
        submitButton: "Daten absenden & Buchung abschließen",
        backButton: "Zurück",
        nextButton: "Weiter",
        uploading: "Lädt hoch...",
        requiredField: "Pflichtfeld",
        copyToastTitle: (field: string) => `${field} kopiert!`,
        infantsTitle: "Kleinkinder (0-2 Jahre)",
        infantsDescription: (count: number) => `Bitte tragen Sie die Namen der ${count} Kleinkinder ein.`,
        infantLabel: (index: number) => `Kleinkind ${index + 1}: Vor- und Nachname`,
    },
    en: {
        steps: ['Guest', 'Companions', 'Payment', 'Details', 'Review'],
        mainGuestTitle: "Your Contact Details (Main Booker)",
        firstNameLabel: "First Name",
        lastNameLabel: "Last Name",
        emailLabel: "Email",
        phoneLabel: "Phone",
        streetLabel: "Street and House Number",
        zipLabel: "Postal Code",
        cityLabel: "City",
        birthDateLabel: "Date of Birth (optional, min. 18)",
        selectDate: "Select date",
        idDocsLabel: "ID Documents",
        idDocsDescription: "Please choose how you would like to provide your ID documents.",
        idDocsDescriptionRequired: "Uploading your ID documents is required for this booking.",
        uploadNow: "Upload now",
        uploadLater: "Show at arrival",
        idFrontLabel: "ID Document (Front)",
        idBackLabel: "ID Document (Back)",
        fileTypeHint: "JPG, PNG, PDF (max 5MB).",
        notesLabel: "Your Remarks (optional)",
        notesPlaceholder: "Do you have any special requests or remarks?",
        fellowTravelersTitle: "Fellow Travelers (Adults & Children)",
        fellowTravelersDescription: (count: number) => `Please enter the names of all ${count} fellow travelers here.`,
        fellowTravelerLabel: (index: number) => `Fellow Traveler ${index + 1}: First and Last Name`,
        fellowTravelerPlaceholder: "First and Last Name",
        noFellowTravelers: "No fellow travelers for this booking.",
        addPerson: "Add another person",
        paymentOptionTitle: "Choose Payment Option",
        paymentOptionDescription: "You can choose to make a down payment or pay the full amount immediately.",
        depositLabel: "Pay 30% deposit",
        fullPaymentLabel: "100% prepayment",
        paymentDetailsTitle: "Payment Details",
        paymentDetailsDescription: "Here you will find the bank details for the transfer. Please upload a confirmation afterwards to proceed.",
        hotelBankDetails: "Hotel Bank Details",
        amountToPay: "Amount to pay",
        accountHolder: "Account Holder",
        iban: "IBAN",
        bic: "BIC",
        bank: "Bank",
        uploadProofLabel: "Upload Proof of Payment",
        uploadProofDescription: "A proof of payment is required to proceed.",
        reviewTitle: "Review and Finalize",
        reviewDescription: "Please check all your details. By submitting the data, you are bindingly finalizing your booking.",
        agb: "I agree to the terms and conditions.",
        agbHint: "By clicking, you confirm the accuracy of your information.",
        validationErrorTitle: "Validation Error",
        serverErrorTitle: "Error",
        submitButton: "Submit Data & Finalize Booking",
        backButton: "Back",
        nextButton: "Next",
        uploading: "Uploading...",
        requiredField: "Required",
        copyToastTitle: (field: string) => `${field} copied!`,
        infantsTitle: "Infants (0-2 years)",
        infantsDescription: (count: number) => `Please enter the names of the ${count} infants.`,
        infantLabel: (index: number) => `Infant ${index + 1}: First and Last Name`,
    },
    it: {
        steps: ['Ospite', 'Accompagnatori', 'Pagamento', 'Dettagli', 'Verifica'],
        mainGuestTitle: "I Suoi Dati di Contatto (Prenotante Principale)",
        firstNameLabel: "Nome",
        lastNameLabel: "Cognome",
        emailLabel: "E-mail",
        phoneLabel: "Telefono",
        streetLabel: "Via e Numero Civico",
        zipLabel: "Codice Postale",
        cityLabel: "Città",
        birthDateLabel: "Data di Nascita (opzionale, min. 18 anni)",
        selectDate: "Seleziona data",
        idDocsLabel: "Documenti d'Identità",
        idDocsDescription: "Si prega di scegliere come fornire i documenti d'identità.",
        idDocsDescriptionRequired: "Il caricamento dei documenti d'identità è obbligatorio per questa prenotazione.",
        uploadNow: "Carica ora",
        uploadLater: "Mostra alla reception",
        idFrontLabel: "Documento d'Identità (Fronte)",
        idBackLabel: "Documento d'Identità (Retro)",
        fileTypeHint: "JPG, PNG, PDF (max 5MB).",
        notesLabel: "Le Sue Note (opzionale)",
        notesPlaceholder: "Ha richieste o note particolari?",
        fellowTravelersTitle: "Accompagnatori (Adulti e Bambini)",
        fellowTravelersDescription: (count: number) => `Inserisca qui i nomi di tutti gli ${count} accompagnatori.`,
        fellowTravelerLabel: (index: number) => `Accompagnatore ${index + 1}: Nome e Cognome`,
        fellowTravelerPlaceholder: "Nome e Cognome",
        noFellowTravelers: "Nessun accompagnatore per questa prenotazione.",
        addPerson: "Aggiungi un'altra persona",
        paymentOptionTitle: "Scegli Opzione di Pagamento",
        paymentOptionDescription: "Puoi scegliere se versare un acconto o saldare subito l'intero importo.",
        depositLabel: "Paga il 30% di acconto",
        fullPaymentLabel: "Pagamento anticipato del 100%",
        paymentDetailsTitle: "Dettagli Pagamento",
        paymentDetailsDescription: "Qui troverà i dati bancari per il bonifico. Si prega di caricare una conferma per procedere.",
        hotelBankDetails: "Dati Bancari dell'Hotel",
        amountToPay: "Importo da pagare",
        accountHolder: "Titolare del Conto",
        iban: "IBAN",
        bic: "BIC",
        bank: "Banca",
        uploadProofLabel: "Carica Prova di Pagamento",
        uploadProofDescription: "È richiesta una prova di pagamento per procedere.",
        reviewTitle: "Verifica e Conclusione",
        reviewDescription: "Si prega di verificare tutti i dati. Inviando i dati, si conclude la prenotazione in modo vincolante.",
        agb: "Accetto i termini e le condizioni generali.",
        agbHint: "Cliccando, si conferma la correttezza dei propri dati.",
        validationErrorTitle: "Errore di Validazione",
        serverErrorTitle: "Errore",
        submitButton: "Invia Dati e Concludi Prenotazione",
        backButton: "Indietro",
        nextButton: "Avanti",
        uploading: "Caricamento...",
        requiredField: "Obbligatorio",
        copyToastTitle: (field: string) => `${field} copiato!`,
        infantsTitle: "Neonati (0-2 anni)",
        infantsDescription: (count: number) => `Si prega di inserire i nomi dei ${count} neonati.`,
        infantLabel: (index: number) => `Neonato ${index + 1}: Nome e Cognome`,
    },
  };
  const value = translations[lang][key];
  if (typeof value === 'function') {
      return value(...args);
  }
  return value || key;
};

type BookingWizardProps = {
  linkId: string;
  initialData: GuestLinkData;
};

type FellowTraveler = { 
    id: number; 
    name: string;
    idFrontUrl: string;
    idBackUrl: string;
};
type Infant = {
    id: number;
    name: string;
}
type PaymentOption = 'deposit' | 'full';

export function BookingWizard({ linkId, initialData }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const lang = initialData.booking.language || 'de';
  const T = (key: TranslationKey, ...args: any[]): string => t(lang, key, ...args) as string;
  const steps = t(lang, 'steps') as string[];
  const locale = locales[lang];
  const idUploadRequirement = initialData.booking.idUploadRequirement || 'choice';

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
  
  const [uploadChoice, setUploadChoice] = useState(idUploadRequirement === 'required' ? 'now' : 'later');
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');

  const totalAdultsAndChildren = initialData.booking.rooms.reduce((sum, room) => sum + room.adults + room.children, 0);
  const numberOfFellowTravelers = totalAdultsAndChildren > 1 ? totalAdultsAndChildren - 1 : 0;
  const numberOfInfants = initialData.booking.rooms.reduce((sum, room) => sum + room.infants, 0);


  const [fellowTravelers, setFellowTravelers] = useState<FellowTraveler[]>(
    Array.from({ length: numberOfFellowTravelers }, (_, i) => ({ id: i + 1, name: '', idFrontUrl: '', idBackUrl: '' }))
  );
  
  const [infants, setInfants] = useState<Infant[]>(
    Array.from({ length: numberOfInfants }, (_, i) => ({ id: i + 1, name: '' }))
  );

  const [formState, formAction, isPending] = useActionState(
    finalizeBookingAction.bind(null, linkId),
    { message: '', errors: null, isValid: true }
  );
  
  const amountToPay = useMemo(() => {
      if (paymentOption === 'deposit') {
          return initialData.booking.price * 0.3;
      }
      return initialData.booking.price;
  }, [paymentOption, initialData.booking.price]);

  const handleUploadComplete = (fileType: string, url: string) => {
    const travelerMatch = fileType.match(/^fellowTraveler_(\d+)_(idFront|idBack)$/);

    if (travelerMatch) {
      const [, travelerId, type] = travelerMatch;
      setFellowTravelers(prev => prev.map(t =>
        t.id === parseInt(travelerId) ? { ...t, [type === 'idFront' ? 'idFrontUrl' : 'idBackUrl']: url } : t
      ));
    } else {
        setDocumentUrls(prev => ({ ...prev, [fileType]: url }));
    }
    setIsUploading(false);
  };
  
  const handleUploadStart = () => {
    setIsUploading(true);
  };
  
  const handleFileDelete = (fileType: string) => {
    const travelerMatch = fileType.match(/^fellowTraveler_(\d+)_(idFront|idBack)$/);

    if (travelerMatch) {
       const [, travelerId, type] = travelerMatch;
       setFellowTravelers(prev => prev.map(t =>
        t.id === parseInt(travelerId) ? { ...t, [type === 'idFront' ? 'idFrontUrl' : 'idBackUrl']: '' } : t
      ));
    } else {
       setDocumentUrls(prev => ({...prev, [fileType]: ''}));
    }
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTravelerNameChange = (id: number, name: string) => {
    setFellowTravelers(prev => prev.map(t => t.id === id ? { ...t, name } : t));
  };
  
  const handleInfantNameChange = (id: number, name: string) => {
    setInfants(prev => prev.map(i => i.id === id ? { ...i, name } : i));
  };


  const isStep1Valid = () => {
    const requiredFields = [formData.firstName, formData.lastName, formData.email, formData.phone, formData.street, formData.zip, formData.city];
    if (requiredFields.some(field => field.trim() === '')) return false;

    if (uploadChoice === 'now' && (!documentUrls.idFront || !documentUrls.idBack)) {
      return false;
    }
    return true;
  };

  const isStep2Valid = () => {
    if (numberOfFellowTravelers > 0) {
      if (!fellowTravelers.every(t => t.name.trim() !== '')) return false;
      if (uploadChoice === 'now' && !fellowTravelers.every(t => t.idFrontUrl && t.idBackUrl)) {
        return false;
      }
    }
    if (numberOfInfants > 0) {
        if (!infants.every(i => i.name.trim() !== '')) return false;
    }
    return true;
  };

  const isStep3Valid = () => {
    return !!paymentOption;
  };

  const isStep4Valid = () => {
    return !!documentUrls.paymentProof;
  };


  const isNextButtonDisabled = () => {
    if (isUploading) return true;
    switch (currentStep) {
      case 0: return !isStep1Valid();
      case 1: return !isStep2Valid();
      case 2: return !isStep3Valid();
      case 3: return !isStep4Valid();
      default: return false;
    }
  }

  const CopyToClipboardButton = ({ textToCopy, fieldName }: { textToCopy: string; fieldName: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({ title: T('copyToastTitle', fieldName), description: textToCopy });
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
              <CardTitle>{T('mainGuestTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="firstName">{T('firstNameLabel')} <span className="text-destructive">*</span></Label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="lastName">{T('lastNameLabel')} <span className="text-destructive">*</span></Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">{T('emailLabel')} <span className="text-destructive">*</span></Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="phone">{T('phoneLabel')} <span className="text-destructive">*</span></Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="street">{T('streetLabel')} <span className="text-destructive">*</span></Label>
                        <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="zip">{T('zipLabel')} <span className="text-destructive">*</span></Label>
                        <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="city">{T('cityLabel')} <span className="text-destructive">*</span></Label>
                        <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="birthDate">{T('birthDateLabel')}</Label>
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
                                {formData.birthDate ? format(new Date(formData.birthDate), 'dd.MM.yyyy', { locale: locale }) : <span>{T('selectDate')}</span>}
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
                                locale={locale}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>{T('idDocsLabel')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {idUploadRequirement === 'required' ? T('idDocsDescriptionRequired') : T('idDocsDescription')}
                    </p>
                    <RadioGroup defaultValue={uploadChoice} value={uploadChoice} onValueChange={(val) => setUploadChoice(val)} className="flex gap-4 pt-2">
                        {idUploadRequirement === 'required' ? (
                          <Label htmlFor="upload-now" className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-4 hover:bg-muted/50 has-[input:checked]:border-primary has-[input:checked]:bg-muted/50">
                              <RadioGroupItem value="now" id="upload-now" />
                              {T('uploadNow')}
                          </Label>
                        ) : (
                          <>
                            <Label htmlFor="upload-now" className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-4 hover:bg-muted/50 has-[input:checked]:border-primary has-[input:checked]:bg-muted/50">
                                <RadioGroupItem value="now" id="upload-now" />
                                {T('uploadNow')}
                            </Label>
                            <Label htmlFor="upload-later" className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border p-4 hover:bg-muted/50 has-[input:checked]:border-primary has-[input:checked]:bg-muted/50">
                                <RadioGroupItem value="later" id="upload-later" />
                                {T('uploadLater')}
                            </Label>
                          </>
                        )}
                    </RadioGroup>
                </div>

                {uploadChoice === 'now' && (
                    <div className="space-y-4 rounded-md border p-4 animate-in fade-in-50">
                        <div className="grid gap-2">
                            <Label>{T('idFrontLabel')} <span className="text-destructive">*</span></Label>
                            <FileUpload
                                lang={lang}
                                bookingId={linkId}
                                fileType="idFront"
                                uploadedFileUrl={documentUrls.idFront || null}
                                onUploadComplete={handleUploadComplete}
                                onUploadStart={handleUploadStart}
                                onDelete={handleFileDelete}
                            />
                             <p className="text-xs text-muted-foreground">{T('fileTypeHint')}</p>
                        </div>
                         <div className="grid gap-2">
                            <Label>{T('idBackLabel')} <span className="text-destructive">*</span></Label>
                             <FileUpload
                                lang={lang}
                                bookingId={linkId}
                                fileType="idBack"
                                uploadedFileUrl={documentUrls.idBack || null}
                                onUploadComplete={handleUploadComplete}
                                onUploadStart={handleUploadStart}
                                onDelete={handleFileDelete}
                            />
                             <p className="text-xs text-muted-foreground">{T('fileTypeHint')}</p>
                        </div>
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="specialRequests">{T('notesLabel')}</Label>
                    <Textarea name="specialRequests" id="specialRequests" placeholder={T('notesPlaceholder')} value={formData.specialRequests} onChange={handleInputChange} />
                </div>
            </CardContent>
          </Card>
        );
      case 1: // Mitreiser & Kleinkinder
        return (
          <Card>
            <CardHeader>
              <CardTitle>{T('fellowTravelersTitle')}</CardTitle>
               <CardDescription>
                {numberOfFellowTravelers > 0 ? T('fellowTravelersDescription', numberOfFellowTravelers) : T('noFellowTravelers')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fellowTravelers.length > 0 && fellowTravelers.map((traveler, index) => (
                <div key={traveler.id} className="space-y-4 rounded-md border p-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-grow">
                      <Label htmlFor={`traveler-name-${traveler.id}`}>{T('fellowTravelerLabel', index)} <span className="text-destructive">*</span></Label>
                      <Input 
                          id={`traveler-name-${traveler.id}`}
                          placeholder={T('fellowTravelerPlaceholder')} 
                          value={traveler.name}
                          onChange={(e) => handleTravelerNameChange(traveler.id, e.target.value)}
                          required
                      />
                    </div>
                  </div>
                  {uploadChoice === 'now' && (
                    <div className='animate-in fade-in-50 space-y-4'>
                        <Separator />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label>{T('idFrontLabel')} <span className="text-destructive">*</span></Label>
                                <FileUpload
                                    lang={lang}
                                    bookingId={linkId}
                                    fileType={`fellowTraveler_${traveler.id}_idFront`}
                                    uploadedFileUrl={traveler.idFrontUrl || null}
                                    onUploadComplete={handleUploadComplete}
                                    onUploadStart={handleUploadStart}
                                    onDelete={handleFileDelete}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>{T('idBackLabel')} <span className="text-destructive">*</span></Label>
                                <FileUpload
                                    lang={lang}
                                    bookingId={linkId}
                                    fileType={`fellowTraveler_${traveler.id}_idBack`}
                                    uploadedFileUrl={traveler.idBackUrl || null}
                                    onUploadComplete={handleUploadComplete}
                                    onUploadStart={handleUploadStart}
                                    onDelete={handleFileDelete}
                                />
                            </div>
                        </div>
                    </div>
                  )}
                </div>
              ))}
              {numberOfInfants > 0 && (
                <>
                <Separator/>
                <div className="space-y-4">
                    <CardTitle className="text-lg">{T('infantsTitle')}</CardTitle>
                    <p className="text-sm text-muted-foreground">{T('infantsDescription', numberOfInfants)}</p>
                    {infants.map((infant, index) => (
                        <div key={infant.id} className="grid gap-2">
                            <Label htmlFor={`infant-name-${infant.id}`}>{T('infantLabel', index)} <span className="text-destructive">*</span></Label>
                            <Input
                                id={`infant-name-${infant.id}`}
                                placeholder={T('fellowTravelerPlaceholder')} 
                                value={infant.name}
                                onChange={(e) => handleInfantNameChange(infant.id, e.target.value)}
                                required
                            />
                        </div>
                    ))}
                </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      case 2: // Zahlungsoption
         return (
          <Card>
            <CardHeader>
              <CardTitle>{T('paymentOptionTitle')}</CardTitle>
              <CardDescription>{T('paymentOptionDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentOption} onValueChange={(val: PaymentOption) => setPaymentOption(val)} className="gap-4">
                 <Label htmlFor="payment-full" className="flex flex-1 cursor-pointer items-center gap-4 rounded-md border p-4 hover:bg-muted/50 has-[input:checked]:border-primary has-[input:checked]:bg-muted/50">
                    <RadioGroupItem value="full" id="payment-full" />
                    <div>
                        <p className="font-semibold">{T('fullPaymentLabel')}</p>
                        <p className="text-sm text-muted-foreground">{new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(initialData.booking.price)}</p>
                    </div>
                </Label>
                <Label htmlFor="payment-deposit" className="flex flex-1 cursor-pointer items-center gap-4 rounded-md border p-4 hover:bg-muted/50 has-[input:checked]:border-primary has-[input:checked]:bg-muted/50">
                    <RadioGroupItem value="deposit" id="payment-deposit" />
                    <div>
                        <p className="font-semibold">{T('depositLabel')}</p>
                        <p className="text-sm text-muted-foreground">{new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(initialData.booking.price * 0.3)}</p>
                    </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        );
      case 3: // Zahlungsdetails
        return (
          <Card>
            <CardHeader>
              <CardTitle>{T('paymentDetailsTitle')}</CardTitle>
               <CardDescription>{T('paymentDetailsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card className="bg-muted/50">
                    <CardHeader><CardTitle className="text-base">{T('hotelBankDetails')}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                         <div className="flex items-center justify-between font-semibold text-lg text-primary">
                            <p>{T('amountToPay')}:</p>
                            <p>{new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(amountToPay)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p><strong>{T('accountHolder')}:</strong> {initialData.hotel.bankDetails.accountHolder}</p>
                            <CopyToClipboardButton textToCopy={initialData.hotel.bankDetails.accountHolder} fieldName={T('accountHolder')} />
                        </div>
                        <div className="flex items-center justify-between">
                             <p><strong>{T('iban')}:</strong> {initialData.hotel.bankDetails.iban}</p>
                             <CopyToClipboardButton textToCopy={initialData.hotel.bankDetails.iban} fieldName={T('iban')} />
                        </div>
                         <div className="flex items-center justify-between">
                            <p><strong>{T('bic')}:</strong> {initialData.hotel.bankDetails.bic}</p>
                            <CopyToClipboardButton textToCopy={initialData.hotel.bankDetails.bic} fieldName={T('bic')} />
                        </div>
                         <div className="flex items-center justify-between">
                            <p><strong>{T('bank')}:</strong> {initialData.hotel.bankDetails.bankName}</p>
                            <CopyToClipboardButton textToCopy={initialData.hotel.bankDetails.bankName} fieldName={T('bank')} />
                        </div>
                    </CardContent>
                </Card>
              <div>
                <Label className="mb-2 block font-medium">{T('uploadProofLabel')} <span className="text-destructive">*</span></Label>
                <FileUpload
                    lang={lang}
                    bookingId={linkId}
                    fileType="paymentProof"
                    uploadedFileUrl={documentUrls.paymentProof || null}
                    onUploadComplete={handleUploadComplete}
                    onUploadStart={handleUploadStart}
                    onDelete={handleFileDelete}
                />
                <p className="text-xs text-muted-foreground mt-2">{T('uploadProofDescription')}</p>
              </div>
            </CardContent>
          </Card>
        );
      case 4: // Prüfung
        return (
          <form action={formAction}>
            <Card>
              <CardHeader>
                <CardTitle>{T('reviewTitle')}</CardTitle>
                <CardDescription>
                  {T('reviewDescription')}
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
                
                {fellowTravelers.map((t) => (
                    <Fragment key={t.id}>
                        <input type="hidden" name={`fellowTraveler_${t.id}_name`} value={t.name} />
                        <input type="hidden" name={`fellowTraveler_${t.id}_idFrontUrl`} value={t.idFrontUrl} />
                        <input type="hidden" name={`fellowTraveler_${t.id}_idBackUrl`} value={t.idBackUrl} />
                    </Fragment>
                ))}
                
                {infants.map((infant) => (
                    <input key={infant.id} type="hidden" name={`infant_${infant.id}_name`} value={infant.name} />
                ))}

                 <input type="hidden" name="idFrontUrl" value={documentUrls.idFront} />
                 <input type="hidden" name="idBackUrl" value={documentUrls.idBack} />
                 <input type="hidden" name="paymentProofUrl" value={documentUrls.paymentProof} />
                 <input type="hidden" name="paymentOption" value={paymentOption} />
                 <input type="hidden" name="amountPaid" value={amountToPay} />


                <div className="flex items-start space-x-2">
                  <Checkbox id="agb" required />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="agb" className="text-sm font-medium">
                      {T('agb')}
                    </label>
                     <p className="text-sm text-muted-foreground">
                      {T('agbHint')}
                    </p>
                  </div>
                </div>
                 {formState?.errors && (
                    <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{T('validationErrorTitle')}</AlertTitle>
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
                    <AlertTitle>{T('serverErrorTitle')}</AlertTitle>
                    <AlertDescription>{formState.message}</AlertDescription>
                    </Alert>
                )}
                <Button type="submit" disabled={isPending || isUploading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {(isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {T('submitButton')}
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
    <div className="space-y-4 md:space-y-8">
       <div className="flex justify-center pt-2 pb-8 sm:pb-12 overflow-x-auto">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="animate-in fade-in-50">{StepContent()}</div>

      {currentStep < 4 && (
        <div className="flex justify-between gap-4">
            <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep - 1)}
                className={cn(currentStep === 0 && 'invisible')}
            >
              {T('backButton')}
            </Button>
          
          <Button 
            onClick={() => setCurrentStep(currentStep + 1)} 
            className="bg-primary hover:bg-primary/90"
            disabled={isNextButtonDisabled()}
            >
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isUploading ? T('uploading') : T('nextButton')}
          </Button>
        </div>
      )}
    </div>
  );
}
