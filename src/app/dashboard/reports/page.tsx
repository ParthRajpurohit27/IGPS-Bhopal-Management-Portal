
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Printer, Search, Calendar, ChevronRight, Calculator, Loader2 } from 'lucide-react';
import { USERS, ATTENDANCE } from '@/lib/db-mock';
import { generateTeacherPayrollAttendanceNarrative } from '@/ai/flows/teacher-payroll-attendance-narrative';
import { toast } from '@/hooks/use-toast';

export default function PayrollSummaryPage() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);

  const handleGenerateReport = () => {
    if (!selectedTeacherId || !startDate || !endDate) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a teacher and a valid date range.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Report Generated",
      description: "Calculating presence, absences, and holidays for the selected period.",
    });
  };

  const generateAISummary = async () => {
    const teacher = USERS.find(u => u.id === selectedTeacherId);
    if (!teacher) return;

    setIsGeneratingNarrative(true);
    
    // Core Logic Data (Available even without AI)
    const stats = {
      present: 20,
      absent: 2,
      holidays: 4,
      total: 24
    };

    try {
      // Attempt AI Generation
      const result = await generateTeacherPayrollAttendanceNarrative({
        teacherName: teacher.name,
        employeeId: teacher.employeeId,
        startDate,
        endDate,
        totalPresentDays: stats.present,
        totalAbsentDays: stats.absent,
        totalHolidayDays: stats.holidays
      });
      setNarrative(result);
    } catch (error) {
      // Fail-Safe Fallback: Generate a standard manual summary if AI fails
      console.error("AI Service Unavailable, falling back to standard logic:", error);
      
      const standardSummary = `Attendance summary for ${teacher.name} (${teacher.employeeId}) from ${startDate} to ${endDate}. 
      Records show ${stats.present} days present, ${stats.absent} absences, and ${stats.holidays} school holidays. 
      Total billable payroll credit: ${stats.total} days. [Standard System Summary]`;
      
      setNarrative(standardSummary);
      
      toast({
        title: "Using Standard Summary",
        description: "The AI narrative service is currently offline. A standard data summary has been generated instead.",
      });
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Payroll Summary Engine</h1>
        <p className="text-muted-foreground">Comprehensive reporting and analytics for salary processing.</p>
      </div>

      <Card className="border-none shadow-md">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="teacher">Select Staff Member</Label>
              <Select onValueChange={setSelectedTeacherId}>
                <SelectTrigger id="teacher" className="h-11">
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {USERS.filter(u => u.role === 'teacher').map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.employeeId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input type="date" id="start" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date</Label>
              <Input type="date" id="end" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-11" />
            </div>
            <Button onClick={handleGenerateReport} className="h-11 font-bold shadow-lg bg-primary">
              <Calculator className="mr-2 h-4 w-4" /> Generate Full Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline text-xl">Attendance Breakdown</CardTitle>
                <CardDescription>Detailed logs for the selected period</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-9 font-semibold">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button variant="outline" size="sm" className="h-9 font-semibold">
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Check-In</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Payroll Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedTeacherId ? (
                    <>
                      <TableRow>
                        <TableCell className="font-medium">May 10, 2024</TableCell>
                        <TableCell>08:15 AM</TableCell>
                        <TableCell><Badge className="bg-green-600 font-bold">PRESENT</Badge></TableCell>
                        <TableCell className="text-right font-bold text-green-700">1.0 Day</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">May 11, 2024</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell><Badge variant="destructive" className="font-bold">ABSENT</Badge></TableCell>
                        <TableCell className="text-right font-bold text-destructive">0.0 Day</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">May 12, 2024</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell><Badge variant="outline" className="border-accent text-accent font-bold">HOLIDAY</Badge></TableCell>
                        <TableCell className="text-right font-bold text-accent">1.0 Day</TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                        Select filters to view report data.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md bg-accent text-white">
            <CardHeader>
              <CardTitle className="font-headline">Summary Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Present Days</span>
                <span className="text-2xl font-bold">20</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Holidays Credited</span>
                <span className="text-2xl font-bold">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Absences</span>
                <span className="text-2xl font-bold">2</span>
              </div>
              <Separator className="bg-white/20" />
              <div className="flex items-center justify-between pt-2">
                <span className="font-headline text-lg font-bold">Total Billable</span>
                <span className="text-3xl font-bold">24 Days</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-headline">Narrative Analysis</CardTitle>
              <CardDescription>AI-enhanced summary for payroll justification</CardDescription>
            </CardHeader>
            <CardContent>
              {narrative ? (
                <div className="p-4 rounded-lg bg-muted/30 text-sm leading-relaxed italic text-muted-foreground border border-muted">
                  {narrative}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground mb-4 font-medium italic">Generate narrative for automated payroll justification.</p>
                  <Button 
                    variant="outline" 
                    className="w-full h-10 border-muted font-bold text-primary"
                    onClick={generateAISummary}
                    disabled={isGeneratingNarrative || !selectedTeacherId}
                  >
                    {isGeneratingNarrative ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Summary"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ children, htmlFor, className }: { children: React.ReactNode, htmlFor: string, className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`text-xs font-bold text-muted-foreground uppercase tracking-widest ${className}`}>
      {children}
    </label>
  );
}
