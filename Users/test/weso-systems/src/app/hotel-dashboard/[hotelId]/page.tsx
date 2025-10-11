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
  TrendingUp,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Booking } from '@/lib/types';
import { format } from 'date-fns';
import {de} from 'date-fns/locale';

export default function HotelierDashboardPage() {
  const params = useParams<{ hotelId: string }>();
  
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [totalBookings, setTotalBookings] = React.useState(0);
  const [todaysArrivals, setTodaysArrivals] = React.useState(0);
  const [pendingActions, setPendingActions] = React.useState(0);
  const [latestBookings, setLatestBookings] = React.useState<Booking[]>([]);


  React.useEffect(() => {
    if (!params.hotelId) return;

    const bookingsCol = collection(db, 'hotels', params.hotelId, 'bookings');
    
    // --- Kennzahlen berechnen ---
    const confirmedQuery = query(bookingsCol, where('status', 'in', ['Confirmed', 'Completed']));
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
          .sort((a, b) => (b.updatedAt || b.createdAt).toMillis() - (a.updatedAt || a.createdAt).toMillis())
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
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold">
          Dashboard
        </h1>
        <Button asChild>
          <Link href={`/hotel-dashboard/${params.hotelId}/bookings/create`}>
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
              Basierend auf bestätigten Buchungen
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
              Inkl. aller Status
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
            <p className="text-xs text-muted-foreground">Geplante Check-ins für heute</p>
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
              Buchungen mit Status "Daten erhalten"
            </p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Letzte Aktivitäten</CardTitle>
            <p className="text-sm text-muted-foreground">
                Die letzten 5 aktualisierten Buchungen.
            </p>
        </CardHeader>
        <CardContent>
          {latestBookings.length > 0 ? (
              <ul className="space-y-4">
                  {latestBookings.map(b => (
                      <li key={b.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium text-foreground">{b.guestName}</span>
                            <span className="text-muted-foreground"> - Status: </span> 
                            <span className="font-medium text-foreground">{b.status}</span>
                          </div>
                           <span className="text-xs text-muted-foreground">
                            {b.updatedAt ? format(b.updatedAt.toDate(), 'dd.MM.yy, HH:mm', {locale: de}) : format(b.createdAt.toDate(), 'dd.MM.yy, HH:mm', {locale: de})}
                           </span>
                      </li>
                  ))}
              </ul>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Noch keine Aktivitäten vorhanden.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
