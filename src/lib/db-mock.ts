export type Role = 'teacher' | 'admin' | 'owner';

export interface User {
  id: string;
  name: string;
  employeeId: string;
  contact: string; // mobile or email
  password: string;
  role: Role;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM
  checkOutTime?: string; // HH:MM
  status: 'present' | 'absent' | 'holiday';
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
}

// Initial Mock Data
export const USERS: User[] = [
  { id: '1', name: 'John Admin', employeeId: 'ADM001', contact: 'admin@school.com', password: 'password', role: 'admin' },
  { id: '2', name: 'Sara Owner', employeeId: 'OWN001', contact: 'owner@school.com', password: 'password', role: 'owner' },
  { id: '3', name: 'Rahul Sharma', employeeId: 'TCH001', contact: '9876543210', password: 'password', role: 'teacher' },
  { id: '4', name: 'Priya Singh', employeeId: 'TCH002', contact: '9876543211', password: 'password', role: 'teacher' },
];

export const HOLIDAYS: Holiday[] = [
  { id: 'h1', date: '2024-08-15', description: 'Independence Day' },
  { id: 'h2', date: '2024-10-02', description: 'Gandhi Jayanti' },
];

export const ATTENDANCE: AttendanceRecord[] = [
  { id: 'a1', userId: '3', date: '2024-05-10', checkInTime: '08:15', status: 'present' },
  { id: 'a2', userId: '4', date: '2024-05-10', checkInTime: '08:30', status: 'present' },
];