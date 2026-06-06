"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ShieldCheck, Smartphone, Mail, Lock, BookOpen, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { APP_CONFIG } from '@/lib/config';

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const schoolLogo = PlaceHolderImages.find(img => img.id === 'school-logo');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const mobile = formData.get('mobile') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const name = formData.get('name') as string;
    const employeeId = formData.get('employeeId') as string;
    const adminCode = formData.get('adminCode') as string;

    if (!title) {
      setError("Please select your professional title.");
      setIsLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    let role = 'teacher';
    if (adminCode === APP_CONFIG.codes.owner) {
      role = 'owner';
    } else if (adminCode === APP_CONFIG.codes.admin) {
      role = 'admin';
    }

    try {
      const authEmail = `${mobile}@igps.internal`;
      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, password);
      const user = userCredential.user;

      const userData = {
        id: user.uid,
        title,
        name,
        employeeId,
        mobile,
        role: role,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      toast({
        title: "Registration Successful",
        description: `Welcome to the faculty, ${title} ${name}.`,
      });
      router.push('/dashboard');

    } catch (err: any) {
      let message = 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This mobile number is already registered.';
      } else {
        message = err.message || 'An unexpected error occurred.';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <BookOpen className="absolute top-10 left-10 h-24 w-24 text-primary" />
        <GraduationCap className="absolute bottom-20 right-20 h-32 w-32 text-accent" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full shadow-lg border-2 border-primary/20 bg-white flex items-center justify-center">
            {schoolLogo?.imageUrl && (
              <Image src={schoolLogo.imageUrl} alt="Logo" fill className="object-contain p-2" />
            )}
          </div>
          <h1 className="mt-4 font-headline text-3xl font-bold tracking-tight text-primary">Staff Onboarding</h1>
          <p className="mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Official Portal</p>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-card/90 backdrop-blur-md">
          <CardContent className="pt-8 px-8 pb-8 space-y-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Professional Title</Label>
                <Select onValueChange={setTitle} required>
                  <SelectTrigger id="title" className="h-11 rounded-xl">
                    <SelectValue placeholder="Select Title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr.">Mr.</SelectItem>
                    <SelectItem value="Ms.">Ms.</SelectItem>
                    <SelectItem value="Mrs.">Mrs.</SelectItem>
                    <SelectItem value="Dr.">Dr.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Full Name</Label>
                  <Input id="name" name="name" placeholder="Full Name" className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Staff ID</Label>
                  <Input id="employeeId" name="employeeId" placeholder="Emp ID" className="h-11 rounded-xl" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">10-Digit Mobile</Label>
                <Input id="mobile" name="mobile" type="tel" placeholder="Mobile Number" maxLength={10} className="h-11 rounded-xl" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Password</Label>
                  <Input id="password" name="password" type="password" className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Confirm</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" className="h-11 rounded-xl" required />
                </div>
              </div>

              <div className="pt-4 border-t border-dashed">
                <div className="space-y-2">
                  <Label htmlFor="adminCode" className="text-xs uppercase font-bold tracking-widest text-primary flex items-center gap-2">
                    <Lock className="h-3 w-3" /> Authorization Code
                  </Label>
                  <Input 
                    id="adminCode" 
                    name="adminCode" 
                    type="password" 
                    placeholder="Owner/Admin Code" 
                    className="h-11 rounded-xl border-primary/20 bg-primary/5 focus:bg-white" 
                  />
                  <p className="text-[9px] text-muted-foreground opacity-70 italic font-medium">Leave blank for Teacher registration.</p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-widest">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-12 font-black uppercase tracking-widest rounded-2xl shadow-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Back to <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
