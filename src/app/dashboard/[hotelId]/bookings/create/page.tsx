
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
import { CalendarIcon, PlusCircle, Trash2, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Room, Hotel } from '@/lib/types';
import { createBookingAction } from '@/actions/hotel-actions';
import { useRouter } from 'next/navigation';
import { CreateBookingClientPage } from './create-booking-client-page';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';

async function getHotelConfig(hotelId: string) {
    const hotelRef = doc(db, 'hotels', hotelId);
    const hotelSnap = await getDoc(hotelRef);

    if (!hotelSnap.exists()) {
        notFound();
    }
    
    const hotelData = hotelSnap.data() as Hotel;

    return {
        roomCategories: hotelData.bookingConfig?.roomCategories || ['Standard'],
        mealTypes: hotelData.bookingConfig?.mealTypes || ['Keine'],
    };
}


export default async function CreateBookingPage({ params }: { params: { hotelId: string } }) {
  const hotelConfig = await getHotelConfig(params.hotelId);
  
  return <CreateBookingClientPage hotelId={params.hotelId} config={hotelConfig} />;
}
