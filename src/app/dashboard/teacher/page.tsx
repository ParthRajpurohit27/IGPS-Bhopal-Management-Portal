
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, MapPin, Loader2, History, AlertCircle, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { format, subDays, isWeekend } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function TeacherAttendancePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [userData, setUserData] = useState<any>(null);
  const [markedToday, setMarkedToday] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showAbsencePrompt, setShowAbsencePrompt] = useState(false);
  const [lastWorkday, setLastWorkday] = useState<string | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const historyQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'attendance'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(10)
    );
  }, [user, db]);
  const { data: attendanceHistory } = useCollection(historyQuery);

  useEffect(() => {
    async function initTeacherPortal() {
      if (!user) return;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) setUserData(userDoc.data());

      const todayId = `${user.uid}_${todayStr}`;
      const todayDoc = await getDoc(doc(db, 'attendance', todayId));
      if (todayDoc.exists()) setMarkedToday(true);

      // Only check for absence once today is handled or skipped
      let prevDate = subDays(new Date(), 1);
      while (isWeekend(prevDate)) {
        prevDate = subDays(prevDate, 1);
      }
      const prevDateStr = format(prevDate, 'yyyy-MM-dd');
      setLastWorkday(prevDateStr);

      const prevId = `${user.uid}_${prevDateStr}`;
      const prevDoc = await getDoc(doc(db, 'attendance', prevId));
      
      // We only show prompt if they missed yesterday AND haven't provided a reason yet
      if (!prevDoc.exists() && !isWeekend(prevDate)) {
        setShowAbsencePrompt(true);
      } else if (prevDoc.exists() && prevDoc.data()?.status === 'absent' && !prevDoc.data()?.note) {
        setShowAbsencePrompt(true);
      }
    }
    initTeacherPortal();
  }, [user, db, todayStr]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMarkPresent = async () => {
    if (!user) return;
    setIsLoading(true);

    const attendanceId = `${user.uid}_${todayStr}`;
    const attendanceData = {
      userId: user.uid,
      date: todayStr,
      checkInTime: format(new Date(), 'HH:mm'),
      status: 'present' as const,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'attendance', attendanceId), attendanceData);
      setMarkedToday(true);
      toast({ title: "Welcome to School", description: "Your arrival has been recorded successfully." });
    } catch (err) {
      toast({ title: "Connection Error", description: "Unable to sync arrival. Please notify administration.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const submitAbsenceReason = async (reason: string) => {
    if (!user || !lastWorkday) return;
    const recordId = `${user.uid}_${lastWorkday}`;
    await setDoc(doc(db, 'attendance', recordId), {
      userId: user.uid,
      date: lastWorkday,
      status: 'absent',
      note: reason,
      timestamp: new Date().toISOString()
    }, { merge: true });
    setShowAbsencePrompt(false);
    toast({ title: "Note Recorded", description: "Your absence explanation has been shared with administration." });
  };

  if (authLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!userData) return null;

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12 animate-in fade-in duration-700">
      <div className="text-center md:text-left space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Namaste, {userData.title || 'Teacher'} {userData.name}</h1>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em]">{userData.employeeId} • Faculty Portal</p>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden rounded-3xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
        <CardHeader className="text-center pb-2 pt-8">
          <CardTitle className="font-headline text-5xl tabular-nums tracking-tighter text-primary">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </CardTitle>
          <CardDescription className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mt-2">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-6 p-8">
          {!markedToday ? (
            <Button 
              onClick={handleMarkPresent} 
              disabled={isLoading}
              className="w-full h-24 text-xl font-black shadow-xl rounded-2xl transition-all active:scale-95 bg-primary hover:bg-primary/90 flex flex-col gap-1"
            >
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : (
                <>
                  <Clock className="h-6 w-6" />
                  <span>MARK ARRIVAL</span>
                </>
              )}
            </Button>
          ) : (
            <div className="w-full animate-in zoom-in duration-500">
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-green-50 text-green-700 border border-green-100 shadow-inner text-center">
                <CheckCircle className="h-10 w-10" />
                <div>
                  <p className="text-lg font-black uppercase">Attendance Logged</p>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Active since {attendanceHistory[0]?.checkInTime}</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            <MapPin className="h-3 w-3" /> IGPS CAMPUS BHOPAL
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-headline text-lg font-bold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> Attendance History
          </h3>
        </div>
        <div className="space-y-3">
          {attendanceHistory?.map((log: any) => (
            <div key={log.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-muted transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${log.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {log.status === 'present' ? <Clock className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(log.date), 'EEE, MMM d')}</p>
                  <p className="font-bold text-sm">{log.status === 'present' ? `Arrival: ${log.checkInTime}` : 'Absent'}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
            </div>
          ))}
          {!attendanceHistory?.length && <p className="text-center py-8 text-sm italic text-muted-foreground">Initializing record history...</p>}
        </div>
      </div>

      <Dialog open={showAbsencePrompt} onOpenChange={setShowAbsencePrompt}>
        <DialogContent className="max-w-[90vw] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">Academic Notice</DialogTitle>
            <DialogDescription className="font-medium text-muted-foreground">
              We noticed you were unable to join us on {format(new Date(lastWorkday!), 'PPP')}. Please provide a brief reason for administrative records.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              id="reason" 
              placeholder="E.g., Medical leave, Personal commitment..." 
              className="min-h-[100px] rounded-xl border-muted focus:ring-primary/20 shadow-inner"
            />
          </div>
          <DialogFooter className="flex flex-row gap-2">
            <Button variant="ghost" onClick={() => setShowAbsencePrompt(false)} className="flex-1 rounded-xl">Remind Me Later</Button>
            <Button 
              className="flex-1 rounded-xl font-bold shadow-lg"
              onClick={() => {
                const val = (document.getElementById('reason') as HTMLTextAreaElement).value;
                submitAbsenceReason(val);
              }}
            >
              Share Reason
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
