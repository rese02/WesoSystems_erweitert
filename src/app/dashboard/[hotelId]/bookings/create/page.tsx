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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Room } from '@/lib/types';
import { createBookingAction } from '@/actions/hotel-actions';
import { useParams } from 'next/navigation';

type RoomState = Room & { id: number };

export default function CreateBookingPage() {
  const params = useParams<{ hotelId: string }>();
  const [date, setDate] = useState<DateRange | undefined>();
  const [rooms, setRooms] = useState<RoomState[]>([
    { id: 1, type: 'Doppelzimmer', adults: 2, children: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addRoom = () => {
    setRooms([
      ...rooms,
      { id: Date.now(), type: 'Einzelzimmer', adults: 1, children: 0 },
    ]);
  };

  const removeRoom = (id: number) => {
    setRooms(rooms.filter((room) => room.id !== id));
  };
  
  const handleCreateBooking = async (formData: FormData) => {
    setLoading(true);
    const result = await createBookingAction(params.hotelId, formData, rooms, date);
    setLoading(false);

    if (result.success) {
      toast({
          title: 'Buchungslink erstellt!',
          description: 'Der Link wurde in die Zwischenablage kopiert und kann an den Gast gesendet werden.'
      });
      navigator.clipboard.writeText(result.link || '');
    } else {
      toast({
        title: 'Fehler',
        description: result.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Neue Buchung anlegen</h1>
        <p className="text-muted-foreground">
          Bereiten Sie eine Buchung vor und generieren Sie einen Link für den Gast.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <form action={handleCreateBooking} className="grid gap-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Gastdaten</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="guestName">Vor- und Nachname</Label>
                <Input id="guestName" name="guestName" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buchungsdaten</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>An- und Abreise</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'dd. LLL y', { locale: de })} -{' '}
                            {format(date.to, 'dd. LLL y', { locale: de })}
                          </>
                        ) : (
                          format(date.from, 'dd. LLL y', { locale: de })
                        )
                      ) : (
                        <span>Datum auswählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      locale={de}
                      required
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Preis (€)</Label>
                <Input id="price" name="price" type="number" step="0.01" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mealType">Verpflegung</Label>
                <Select name="mealType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Verpflegung auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Frühstück">Frühstück</SelectItem>
                    <SelectItem value="Halbpension">Halbpension</SelectItem>
                    <SelectItem value="Vollpension">Vollpension</SelectItem>
                    <SelectItem value="Keine">Keine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="language">Sprache für Gast</Label>
                <Select name="language" defaultValue="de">
                  <SelectTrigger>
                    <SelectValue placeholder="Sprache auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">Englisch</SelectItem>
                    <SelectItem value="it">Italienisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zimmerkonfiguration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rooms.map((room, index) => (
                <div key={room.id} className="grid grid-cols-12 gap-2 rounded-md border p-4">
                  <div className="col-span-11 grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label>Zimmertyp</Label>
                      <Select 
                        defaultValue={room.type} 
                        onValueChange={(value) => {
                          const newRooms = [...rooms];
                          newRooms[index].type = value;
                          setRooms(newRooms);
                        }}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Einzelzimmer">Einzelzimmer</SelectItem>
                          <SelectItem value="Doppelzimmer">Doppelzimmer</SelectItem>
                          <SelectItem value="Suite">Suite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Erwachsene</Label>
                      <Input type="number" min="1" defaultValue={room.adults} onChange={(e) => {
                          const newRooms = [...rooms];
                          newRooms[index].adults = parseInt(e.target.value);
                          setRooms(newRooms);
                        }}/>
                    </div>
                    <div className="grid gap-2">
                      <Label>Kinder</Label>
                      <Input type="number" min="0" defaultValue={room.children} onChange={(e) => {
                          const newRooms = [...rooms];
                          newRooms[index].children = parseInt(e.target.value);
                          setRooms(newRooms);
                        }}/>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    {rooms.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeRoom(room.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addRoom}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Zimmer hinzufügen
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Interne Bemerkungen</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea name="internalNotes" placeholder="z.B. VIP-Gast, besondere Wünsche vermerken..." />
            </CardContent>
          </Card>
          
           <div className="lg:col-span-2">
                <Card className="sticky top-20">
                    <CardHeader>
                    <CardTitle>Aktionen</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Buchung mit Link erstellen
                    </Button>
                    </CardContent>
                </Card>
            </div>
        </form>

      </div>
    </div>
  );
}
