"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Plus, Trash2, MapPin } from 'lucide-react';
import { HOLIDAYS } from '@/lib/db-mock';
import { format } from 'date-fns';

export default function HolidayManagerPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [holidays, setHolidays] = useState(HOLIDAYS);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Academic Holiday Manager</h1>
        <p className="text-muted-foreground">Set mandatory school holidays to ensure accurate payroll credits.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="font-headline">Schedule New</CardTitle>
            <CardDescription className="text-primary-foreground/70">Select date from calendar</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center">
            <CalendarUI
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-none"
            />
            <div className="w-full mt-4 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Selected Date</p>
                <p className="font-bold text-primary">{date ? format(date, 'PPP') : 'None selected'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Description</p>
                <input 
                  placeholder="e.g. Winter Break" 
                  className="w-full h-10 px-3 rounded-lg border border-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button className="w-full font-bold shadow-lg" disabled={!date}>
                <Plus className="mr-2 h-4 w-4" /> Add to Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Upcoming Holidays</CardTitle>
            <CardDescription>Scheduled school-wide breaks for the academic year.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {holidays.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-6 hover:bg-muted/20 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                      <CalendarIcon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold text-primary">{h.description}</p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {format(new Date(h.date), 'PPPP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-accent text-accent font-bold px-3">FULL DAY</Badge>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {holidays.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground font-medium italic">No holidays scheduled yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}