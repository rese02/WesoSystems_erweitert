'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function WidgetPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Buchungswidget</h1>
                <p className="mt-1 text-muted-foreground">
                    Hier wird in Zukunft das Buchungswidget konfiguriert.
                </p>
            </div>

            <Card className="flex flex-col items-center justify-center text-center p-12 border-dashed">
                <Package className="h-16 w-16 text-muted-foreground mb-4"/>
                <h2 className="text-xl font-semibold">Seite in Entwicklung</h2>
                <p className="text-muted-foreground mt-1">Diese Funktion wird in Kürze verfügbar sein.</p>
            </Card>
        </div>
    )
}
