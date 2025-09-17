'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BookOpen,
  LogIn,
  AlertTriangle,
  Circle,
  TrendingUp,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { collection, onSnapshot, query, where, getCountFromServer, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Booking } from '@/lib/types';
import { format } from 'date-fns';

export default function HotelierDashboardPage() {
  const params = useParams<{ hotelId: string }>();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [totalBookings, setTotalBookings] = React.useState(0);
  const [todaysArrivals, setTodaysArrivals] = React.useState(0);
  const [pendingActions, setPendingActions] = React.useState(0);
  const [latestBookings, setLatestBookings] = React.useState<Booking[]>([]);


  React.useEffect(() => {
    if (!params.hotelId) return;

    const bookingsCol = collection(db, 'hotels', params.hotelId, 'bookings');
    
    // --- Kennzahlen berechnen ---
    const confirmedQuery = query(bookingsCol, where('status', '==', 'Confirmed'));
    const allQuery = query(bookingsCol);
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const arrivalsQuery = query(bookingsCol, 
        where('checkIn', '>=', Timestamp.fromDate(todayStart)),
        where('checkIn', '<=', Timestamp.fromDate(todayEnd)),
    );

    const pendingQuery = query(bookingsCol, where('status', '==', 'Data Provided'));


    const unsubRevenue = onSnapshot(confirmedQuery, (snap) => {
        const revenue = snap.docs.reduce((sum, doc) => sum + doc.data().price, 0);
        setTotalRevenue(revenue);
    });

    const unsubArrivals = onSnapshot(arrivalsQuery, (snap) => {
        setTodaysArrivals(snap.size);
    });

    const unsubPending = onSnapshot(pendingQuery, (snap) => {
        setPendingActions(snap.size);
    });

    const unsubTotal = onSnapshot(allQuery, (snap) => {
        setTotalBookings(snap.size);
        
        // Letzte Aktivitäten (die 5 neusten Buchungen)
        const latest = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Booking))
          .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
          .slice(0, 5);
        setLatestBookings(latest);
    });


    return () => {
        unsubRevenue();
        unsubArrivals();
        unsubPending();
        unsubTotal();
    }
  }, [params.hotelId]);


  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold">
          Dashboard
        </h1>
        <Button asChild>
          <Link href={`/dashboard/${params.hotelId}/bookings/create`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Neue Buchung
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR',
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Bestätigte Buchungen
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gesamtbuchungen
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Inkl. stornierte
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Heutige Anreisen
            </CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysArrivals}</div>
            <p className="text-xs text-muted-foreground">Geplante Check-ins</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ausstehende Aktionen
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingActions}</div>
            <p className="text-xs text-muted-foreground">
              z.B. fehlende Dokumente
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Systemstatus</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                <span className="text-sm font-medium">Datenbank</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                <span className="text-sm font-medium">KI-Dienste</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                <span className="text-sm font-medium">Speicher</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                <span className="text-sm font-medium">E-Mail Versand</span>
              </div>
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
                <CardTitle>Letzte Aktivitäten</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Die letzten 5 aktualisierten Buchungen.
                </p>
            </CardHeader>
            <CardContent>
              {latestBookings.length > 0 ? (
                  <ul className="space-y-3">
                      {latestBookings.map(b => (
                          <li key={b.id} className="text-sm text-muted-foreground">
                              Buchung für <span className="font-medium text-foreground">{b.guestName}</span> wurde aktualisiert. Status: <span className="font-medium text-foreground">{b.status}</span>
                          </li>
                      ))}
                  </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Noch keine Aktivitäten vorhanden.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Buchungskalender</CardTitle>
            <p className="text-sm text-muted-foreground">Anreisen & Abreisen auf einen Blick.</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              classNames={{
                day_selected:
                  'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90',
                day_today: 'bg-accent/50 text-accent-foreground',
              }}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-full bg-primary"></span>
                <span>Anreise</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-full bg-red-500"></span>
                <span>Abreise</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
