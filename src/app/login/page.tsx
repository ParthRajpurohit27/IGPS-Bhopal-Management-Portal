
"use client";

import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShieldCheck, BookOpen, GraduationCap, PenTool } from 'lucide-react';

export default function LoginPage() {
  const schoolLogo = PlaceHolderImages.find(img => img.id === 'school-logo');
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05]">
        <BookOpen className="absolute top-10 left-10 h-24 w-24 text-primary animate-pulse" />
        <GraduationCap className="absolute bottom-20 right-20 h-32 w-32 text-accent animate-bounce" style={{ animationDuration: '6s' }} />
        <PenTool className="absolute top-1/4 right-1/4 h-16 w-16 text-primary opacity-50" />
        <div className="absolute top-1/2 left-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/2 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-full shadow-2xl border-4 border-primary/10 bg-white flex items-center justify-center">
            {schoolLogo?.imageUrl ? (
              <Image
                src={schoolLogo.imageUrl}
                alt="IGPS Bhopal Logo"
                fill
                className="object-contain p-2"
              />
            ) : (
              <ShieldCheck className="h-16 w-16 text-primary/40" />
            )}
          </div>
          <h1 className="mt-6 font-headline text-3xl font-bold tracking-tight text-primary leading-tight">
            Indira Gandhi Public School, <br /> Bhopal
          </h1>
          <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-60">
            Professional Governance Portal
          </p>
        </div>

        <div className="rounded-3xl border bg-card/90 p-8 shadow-[0_25px_60px_rgba(40,79,127,0.15)] border-white/60 backdrop-blur-xl">
          <LoginForm />
          <p className="mt-8 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-40">
             Authorized Personnel Only
          </p>
        </div>

        <div className="text-center space-y-2">
          <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest text-center">
            © {currentYear || '2024'} Academic Governance
          </p>
          <p className="text-[9px] text-primary/40 font-bold uppercase tracking-[0.4em] text-center">
            Developed by Parth Rajpurohit
          </p>
        </div>
      </div>
    </div>
  );
}
