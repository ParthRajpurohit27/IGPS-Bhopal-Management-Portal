
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ArrowRight, Smartphone, Lock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const mobile = formData.get('mobile') as string;
    const password = formData.get('password') as string;

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      setIsLoading(false);
      return;
    }

    try {
      const authEmail = `${mobile}@igps.internal`;
      const userCredential = await signInWithEmailAndPassword(auth, authEmail, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        toast({
          title: "Access Granted",
          description: `Welcome back, ${userDoc.data().name}.`,
        });
        router.push('/dashboard');
      } else {
        setError('Staff profile record not found.');
        setIsLoading(false);
      }
    } catch (err: any) {
      let msg = 'Invalid credentials provided.';
      if (err.code === 'auth/user-not-found') msg = 'Mobile number not registered.';
      if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
      
      setError(msg);
      setIsLoading(false);
      toast({
        title: "Login Failed",
        description: msg,
        variant: "destructive"
      });
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="mobile" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Smartphone className="h-3.5 w-3.5" /> Mobile Number
          </Label>
          <Input
            id="mobile"
            name="mobile"
            type="tel"
            placeholder="9876543210"
            maxLength={10}
            required
            disabled={isLoading}
            className="h-12 border-muted rounded-xl bg-muted/20 focus:bg-white transition-all text-base font-bold"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Lock className="h-3.5 w-3.5" /> Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
            className="h-12 border-muted rounded-xl bg-muted/20 focus:bg-white transition-all"
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-bold text-destructive text-center uppercase tracking-widest leading-tight">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full h-14 text-base font-black shadow-lg shadow-primary/20 rounded-2xl group transition-all hover:scale-[1.02] active:scale-95" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <>
              LOG IN <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
