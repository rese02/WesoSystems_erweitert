import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, BedDouble, Euro, Users } from 'lucide-react';

export function BookingSummaryCard() {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline">Ihre Buchung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Zeitraum</span>
          </div>
          <span className="font-medium">01.08. - 07.08.2024</span>
        </div>
        <Separator />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BedDouble className="h-4 w-4" />
            <span>Zimmer</span>
          </div>
          <div className="text-right font-medium">
            <p>1x Doppelzimmer</p>
            <p>1x Einzelzimmer</p>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Gäste</span>
          </div>
          <div className="text-right font-medium">
            <p>3 Erwachsene</p>
            <p>1 Kind</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Euro className="h-5 w-5" />
            <span>Gesamtpreis</span>
          </div>
          <span className="font-bold">€ 1.200,00</span>
        </div>
      </CardContent>
    </Card>
  );
}
