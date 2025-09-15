'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useParams } from 'next/navigation';

const chartData = [
  { date: 'Mo', revenue: 1250 },
  { date: 'Di', revenue: 1800 },
  { date: 'Mi', revenue: 1500 },
  { date: 'Do', revenue: 2200 },
  { date: 'Fr', revenue: 2100 },
  { date: 'Sa', revenue: 2800 },
  { date: 'So', revenue: 2400 },
];

const chartConfig = {
  revenue: {
    label: 'Umsatz',
    color: 'hsl(var(--primary))',
  },
};

export default function HotelierDashboardPage() {
  const params = useParams<{ hotelId: string }>();
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">
        Dashboard für <span className='capitalize'>{params.hotelId}</span>
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtumsatz (Woche)</CardTitle>
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
              +5.2% zum Vormonat
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
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              In den letzten 30 Tagen
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
            <div className="text-2xl font-bold">1</div>
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
              <CardTitle>Umsatzprognose</CardTitle>
              <CardDescription>
                Wöchentliche Umsatzentwicklung
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={8} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
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
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Buchungskalender</CardTitle>
            <CardDescription>Anreisen & Abreisen auf einen Blick.</CardDescription>
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
