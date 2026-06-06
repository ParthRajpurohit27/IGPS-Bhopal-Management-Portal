
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar, 
  AlertTriangle,
  Zap
} from 'lucide-react';

const attendanceData = [
  { name: 'Mon', present: 18, absent: 2 },
  { name: 'Tue', present: 19, absent: 1 },
  { name: 'Wed', present: 15, absent: 5 },
  { name: 'Thu', present: 17, absent: 3 },
  { name: 'Fri', present: 20, absent: 0 },
];

const punchInTrends = [
  { time: '08:00', count: 5 },
  { time: '08:15', count: 12 },
  { time: '08:30', count: 8 },
  { time: '08:45', count: 2 },
  { time: '09:00', count: 1 },
];

const departmentSplit = [
  { name: 'Primary', value: 12, color: '#284F7F' },
  { name: 'Secondary', value: 8, color: '#6B6BCE' },
  { name: 'Admin', value: 4, color: '#10b981' },
];

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Attendance Insights</h1>
          <p className="text-muted-foreground">Visual analytics and trend forecasting for IGPS Bhopal.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
          <Zap className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">AI Analysis Active</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4" /> Avg. Presence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">92.4%</div>
            <p className="text-xs text-green-600 font-bold mt-1">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4" /> Punctuality Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">88.0%</div>
            <p className="text-xs text-amber-600 font-bold mt-1">-0.5% shift this week</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Anomalies Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Manual review recommended</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Weekly Presence Breakdown</CardTitle>
            <CardDescription>Daily count of present vs absent faculty members</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Punch-In Time Distribution</CardTitle>
            <CardDescription>Frequency of teacher arrivals throughout the morning</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={punchInTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: 'hsl(var(--accent))' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Staff Composition</CardTitle>
            <CardDescription>Total headcount distributed by department</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentSplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {departmentSplit.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs font-bold text-muted-foreground uppercase">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> AI Predictive Note
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed opacity-90">
              Based on the last 30 days of records, teacher absenteeism tends to increase by 12% on Wednesdays. 
              Punctuality is highest on Mondays. 
              Recommendation: Schedule important faculty briefings on Mondays at 08:30 AM for maximum attendance.
            </p>
            <div className="p-4 rounded-xl bg-white/10 border border-white/20">
              <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Next Month Projection</p>
              <p className="font-bold">94% Expected Presence</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
