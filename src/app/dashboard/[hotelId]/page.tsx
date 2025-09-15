'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DollarSign,
  BookOpen,
  LogIn,
  AlertTriangle,
  Circle,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

export default function HotelierDashboardPage() {
  const params = useParams<{ hotelId: string }>();
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0,00 €</div>
            <p className="text-xs text-muted-foreground">Bestätigte Buchungen</p>
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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Inkl. stornierte</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heutige Anreisen</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">z.B. fehlende Dokumente</p>
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
              <CardDescription>
                Die letzten 5 aktualisierten Buchungen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                Noch keine Aktivitäten vorhanden.
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Buchungskalender</CardTitle>
            <CardDescription>
              Anreisen und Abreisen auf einen Blick.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              classNames={{
                day_selected: "bg-primary text-primary-foreground",
                day_today: "bg-accent/50 text-accent-foreground",
              }}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
               <div className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full bg-green-500"></span>
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

import * as React from 'react';
