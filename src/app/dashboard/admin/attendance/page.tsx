"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Edit2, RotateCcw, Filter, UserCheck, UserX } from 'lucide-react';
import { USERS, ATTENDANCE } from '@/lib/db-mock';
import { format } from 'date-fns';

export default function HistoricalRecordEditor() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Historical Record Editor</h1>
          <p className="text-muted-foreground">Manually update or override attendance status for any date.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="date" 
              className="pl-10 w-44" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-muted font-semibold">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Daily Roster - {format(new Date(date), 'PPP')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Staff Member</TableHead>
                <TableHead className="font-bold">Emp ID</TableHead>
                <TableHead className="font-bold">Log Time</TableHead>
                <TableHead className="font-bold">Current Status</TableHead>
                <TableHead className="text-right font-bold">Override Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {USERS.filter(u => u.role === 'teacher').map((user) => {
                const record = ATTENDANCE.find(a => a.userId === user.id && a.date === date);
                return (
                  <TableRow key={user.id} className="group">
                    <TableCell className="font-bold">{user.name}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">{user.employeeId}</TableCell>
                    <TableCell>
                      {record ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">{record.checkInTime}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground italic">No Log</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record ? (
                        <Badge className="bg-green-600 hover:bg-green-600 font-bold px-3">PRESENT</Badge>
                      ) : (
                        <Badge variant="destructive" className="font-bold px-3">ABSENT</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" className="h-8 border-green-200 text-green-700 hover:bg-green-50">
                          <UserCheck className="mr-1 h-3.5 w-3.5" /> Mark Present
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 border-destructive/20 text-destructive hover:bg-destructive/5">
                          <UserX className="mr-1 h-3.5 w-3.5" /> Mark Absent
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 border-muted">
                          <Calendar className="mr-1 h-3.5 w-3.5" /> Holiday
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}