'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { Stepper } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { FileUpload } from './file-upload';
import { finalizeBookingAction } from '@/actions/guest-actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const steps = ['Gast', 'Mitreiser', 'Zahlung', 'Prüfung'];

export function BookingWizard({ linkId }: { linkId: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fellowTravelers, setFellowTravelers] = useState([{ id: 1, name: '' }]);

  const [formState, formAction] = useFormState(
    finalizeBookingAction.bind(null, linkId),
    { message: '', errors: null, isValid: true }
  );

  const addTraveler = () => {
    setFellowTravelers([...fellowTravelers, { id: Date.now(), name: '' }]);
  };

  const removeTraveler = (id: number) => {
    setFellowTravelers(fellowTravelers.filter((t) => t.id !== id));
  };
  
  function SubmitButton() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { pending } = useFormStatus();
    return (
      <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Daten absenden & Buchung abschließen
      </Button>
    )
  }

  const StepContent = () => {
    switch (currentStep) {
      case 0: // Gast
        return (
          <Card>
            <CardHeader>
              <CardTitle>Ihre Kontaktdaten</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Vorname</Label>
                <Input id="firstName" name="firstName" defaultValue="Max" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input id="lastName" name="lastName" defaultValue="Mustermann" required />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" name="email" type="email" defaultValue="max@example.com" required />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="street">Straße und Hausnummer</Label>
                <Input id="street" name="street" defaultValue="Musterstraße 1" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">Postleitzahl</Label>
                <Input id="zip" name="zip" defaultValue="12345" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Stadt</Label>
                <Input id="city" name="city" defaultValue="Musterstadt" required />
              </div>
              <div className="flex items-center space-x-2 sm:col-span-2">
                <Checkbox id="upload-ids" />
                <label htmlFor="upload-ids" className="text-sm">
                  Ausweise online hochladen (optional)
                </label>
              </div>
            </CardContent>
          </Card>
        );
      case 1: // Mitreiser
        return (
          <Card>
            <CardHeader>
              <CardTitle>Mitreisende Personen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fellowTravelers.map((traveler) => (
                <div key={traveler.id} className="flex items-end gap-2">
                  <div className="flex-grow">
                    <Label>Vor- und Nachname</Label>
                    <Input placeholder="Erika Mustermann" />
                  </div>
                  {fellowTravelers.length > 1 && (
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
            </CardHeader>
            <CardContent className="space-y-6">
                <Card className="bg-muted/50">
                    <CardHeader><CardTitle className="text-base">Bankdaten des Hotels</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>IBAN:</strong> DE89 3704 0044 0532 0130 00</p>
                        <p><strong>BIC:</strong> COBADEFFXXX</p>
                        <p><strong>Bank:</strong> Commerzbank</p>
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
              </CardHeader>
              <CardContent className="space-y-6">
                <p>
                  Bitte überprüfen Sie alle Ihre Angaben. Mit dem Absenden der
                  Daten schließen Sie Ihre Buchung verbindlich ab.
                </p>
                {/* Hidden fields for data submission */}
                <input type="hidden" name="firstName" value="Max" />
                <input type="hidden" name="lastName" value="Mustermann" />
                <input type="hidden" name="email" value="max@example.com" />
                <input type="hidden" name="street" value="Musterstraße 1" />
                <input type="hidden" name="zip" value="12345" />
                <input type="hidden" name="city" value="Musterstadt" />

                <Textarea name="specialRequests" placeholder="Haben Sie besondere Wünsche oder Anmerkungen?" />
                <div className="flex items-center space-x-2">
                  <Checkbox id="agb" required />
                  <label htmlFor="agb" className="text-sm">
                    Ich stimme den Allgemeinen Geschäftsbedingungen zu.
                  </label>
                </div>
                 {formState.errors && (
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
                <SubmitButton />
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
        <div className="flex justify-end gap-4">
          {currentStep > 0 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Zurück
            </Button>
          )}
          <Button onClick={() => setCurrentStep(currentStep + 1)} className="bg-primary hover:bg-primary/90">
            Weiter
          </Button>
        </div>
      )}
    </div>
  );
}
