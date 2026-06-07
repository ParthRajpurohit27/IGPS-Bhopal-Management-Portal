"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  LogOut, 
  UserCircle,
  Clock,
  ClipboardCheck,
  ShieldCheck,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: authLoading } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>('');
  const schoolLogo = PlaceHolderImages.find(img => img.id === 'school-logo');

  useEffect(() => {
    // Set formatted date only on the client to avoid hydration mismatch
    setCurrentDate(format(new Date(), 'EEEE, MMMM do'));
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      if (!authLoading) {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            router.push('/login');
          }
        } else {
          router.push('/login');
        }
        setLoading(false);
      }
    }
    fetchUserData();
  }, [user, authLoading, db, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <ShieldCheck className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-sm font-bold text-primary animate-bounce">Synchronizing Portal...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  const isAdminOrOwner = userData.role === 'admin' || userData.role === 'owner';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', show: true },
    { name: 'My Attendance', icon: Clock, path: '/dashboard/teacher', show: userData.role === 'teacher' },
    { name: 'Staff Management', icon: Users, path: '/dashboard/admin/users', show: isAdminOrOwner },
    { name: 'Holiday Schedule', icon: Calendar, path: '/dashboard/admin/holidays', show: isAdminOrOwner },
    { name: 'Override Logs', icon: ClipboardCheck, path: '/dashboard/admin/attendance', show: isAdminOrOwner },
    { name: 'Reports', icon: FileText, path: '/dashboard/reports', show: isAdminOrOwner },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r shadow-2xl">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3 px-2">
              <div className="relative flex h-10 w-10 overflow-hidden rounded-lg bg-white shadow-inner">
                {schoolLogo?.imageUrl && (
                  <Image
                    src={schoolLogo.imageUrl}
                    alt="School Logo"
                    fill
                    className="object-contain p-1"
                  />
                )}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-sm font-bold text-sidebar-foreground truncate leading-none mb-1">IGPS Bhopal</h2>
                <p className="text-[8px] font-bold uppercase tracking-widest text-sidebar-foreground/60">Faculty Portal</p>
              </div>
            </div>
          </SidebarHeader>
          <Separator className="bg-sidebar-border/30" />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-6 text-sidebar-foreground/40 text-[9px] uppercase tracking-[0.2em]">Navigation</SidebarGroupLabel>
              <SidebarMenu>
                {menuItems.filter(i => i.show).map((item) => (
                  <SidebarMenuItem key={item.path} className="px-2">
                    <SidebarMenuButton 
                      isActive={pathname === item.path}
                      onClick={() => router.push(item.path)}
                      className="h-10 rounded-lg transition-transform hover:translate-x-1"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium text-xs">{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-4">
            <div className="rounded-xl bg-sidebar-accent/40 p-3 border border-white/5 shadow-sm">
              <div className="flex items-center gap-3">
                <UserCircle className="h-8 w-8 text-sidebar-foreground/80" />
                <div className="overflow-hidden">
                  <p className="truncate text-xs font-bold text-sidebar-foreground">{userData.title} {userData.name}</p>
                  <p className="truncate text-[9px] uppercase font-bold text-sidebar-foreground/60">{userData.role}</p>
                </div>
              </div>
              <Separator className="my-2 bg-sidebar-border/30" />
              <button onClick={handleLogout} className="flex w-full items-center gap-2 text-[10px] font-bold text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors uppercase tracking-widest">
                <LogOut className="h-3 w-3" /> Sign Out
              </button>
            </div>
            <div className="text-center pb-2">
               <p className="text-[8px] text-sidebar-foreground/30 font-bold uppercase tracking-[0.3em]">
                 Made by Parth Rajpurohit
               </p>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex flex-col w-full overflow-hidden">
          <header className="flex h-14 items-center border-b bg-card/30 backdrop-blur-md px-4 sticky top-0 z-30 justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="md:hidden font-headline font-bold text-sm text-primary">IGPS BHOPAL</span>
            </div>
            <div className="flex items-center gap-4">
               <p className="hidden md:block text-xs font-bold text-primary opacity-60 uppercase tracking-widest">
                 {currentDate}
               </p>
               <Button variant="ghost" size="icon" onClick={() => window.location.reload()} className="h-8 w-8">
                 <RefreshCw className="h-4 w-4 text-primary" />
               </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-5xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
