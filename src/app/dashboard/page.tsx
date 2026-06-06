
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, Users, Calendar, ShieldCheck, Loader2, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { doc, getDoc, collection, query, where } from 'firebase/firestore';
import { format } from 'date-fns';

export default function DashboardHome() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const teachersQuery = useMemo(() => query(collection(db, 'users'), where('role', '==', 'teacher')), [db]);
  const { data: teachers, loading: teachersLoading } = useCollection(teachersQuery);

  const attendanceQuery = useMemo(() => query(collection(db, 'attendance'), where('date', '==', selectedDate)), [db, selectedDate]);
  const { data: attendanceDocs, loading: attendanceLoading } = useCollection(attendanceQuery);

  useEffect(() => {
    async function fetchUserData() {
      if (!authLoading) {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            if (data.role === 'teacher') {
              router.push('/dashboard/teacher');
            }
          }
        }
        setLoading(false);
      }
    }
    fetchUserData();
  }, [user, authLoading, db, router]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData || userData.role === 'teacher') return null;

  const presentCount = attendanceDocs.filter(a => a.status === 'present').length;
  const totalStaff = teachers.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Academic Command Centre</h1>
          <p className="text-muted-foreground">Namaste, {userData.title} {userData.name}. High-precision monitoring active.</p>
        </div>
        <div className="flex items-center gap-3 bg-card p-2 rounded-xl border shadow-sm w-fit">
          <Calendar className="h-4 w-4 text-primary ml-2" />
          <Input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="border-none bg-transparent focus-visible:ring-0 w-36 h-8 text-sm font-bold"
          />
          <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8 hover:bg-primary/10">
            <RefreshCw className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-md overflow-hidden group">
          <div className="h-1 bg-green-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Faculty Present</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{presentCount}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-100 group-hover:text-green-500 transition-colors duration-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md overflow-hidden group">
          <div className="h-1 bg-red-500" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending Arrivals</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{Math.max(0, totalStaff - presentCount)}</p>
              </div>
              <UserX className="h-8 w-8 text-red-100 group-hover:text-red-500 transition-colors duration-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md overflow-hidden group">
          <div className="h-1 bg-primary" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Staff Count</p>
                <p className="text-3xl font-bold mt-1 text-primary">{totalStaff}</p>
              </div>
              <Users className="h-8 w-8 text-primary/10 group-hover:text-primary transition-colors duration-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-muted/20">
          <div>
            <CardTitle className="font-headline text-xl">Daily Roster - {format(new Date(selectedDate), 'PPP')}</CardTitle>
            <CardDescription>Live attendance synchronization active</CardDescription>
          </div>
          <Badge variant="outline" className="animate-pulse bg-green-50 text-green-700 border-green-200 font-bold">LIVE SYNC</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Staff Member</TableHead>
                  <TableHead className="font-bold">Emp ID</TableHead>
                  <TableHead className="font-bold">Check-In Time</TableHead>
                  <TableHead className="font-bold text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachersLoading || attendanceLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell>
                  </TableRow>
                ) : teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">No faculty records found.</TableCell>
                  </TableRow>
                ) : teachers.map((teacher: any) => {
                  const record = attendanceDocs.find(a => a.userId === teacher.id);
                  return (
                    <TableRow key={teacher.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold text-sm">
                        {teacher.title} {teacher.name}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-muted-foreground uppercase">{teacher.employeeId}</TableCell>
                      <TableCell>
                        {record?.checkInTime ? (
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <Clock className="h-3.5 w-3.5" /> {record.checkInTime}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic opacity-50">Not logged</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {record?.status === 'present' ? (
                          <Badge className="bg-green-600 px-3 font-bold border-none">PRESENT</Badge>
                        ) : (
                          <Badge variant="destructive" className="px-3 font-bold border-none">ABSENT</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center pt-8">
        <p className="text-[10px] text-primary/40 font-bold uppercase tracking-[0.4em]">
          Designed for Academic Excellence by Parth Rajpurohit
        </p>
      </div>
    </div>
  );
}
