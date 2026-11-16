"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, UploadCloud, Users } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.8, delay: 0.3 })
      .from(".hero-title", { y: 40, opacity: 0, duration: 1, stagger: 0.15 }, "-=0.6")
      .from(".hero-subtitle", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(".hero-cta", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.6")
      .from(".hero-card", { 
        y: 60, 
        opacity: 0, 
        duration: 1, 
        stagger: 0.15,
        rotation: 5,
        transformOrigin: "center center"
      }, "-=0.4");
      
    // Floating animation for cards
    gsap.to(".hero-card", {
      y: -15,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      stagger: 0.2
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 md:pt-28 md:pb-32 overflow-hidden bg-zinc-50 dark:bg-background transition-colors">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white dark:from-blue-950/30 dark:via-background dark:to-background pointer-events-none" />
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[40rem] h-[40rem] bg-blue-50 dark:bg-blue-950/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <div className="hero-badge inline-flex items-center rounded-full border border-zinc-200 dark:border-border bg-white dark:bg-card px-3.5 py-1 text-sm font-medium text-zinc-600 dark:text-muted-foreground mb-8 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
            Dynamic Record v1.0 is now live
          </div>
          
          <h1 className="hero-title text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-foreground mb-6 max-w-4xl leading-tight">
            Unify Your Data Collection with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Dynamic Templates</span>
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-zinc-600 dark:text-muted-foreground mb-10 max-w-2xl leading-relaxed">
            Build custom forms, collect rich records including photos, and seamlessly sync everything directly to structured folders in Google Drive. Built for teams of all sizes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <Link href="/login" className="hero-cta">
              <Button size="lg" className="h-14 px-8 text-lg rounded-[4px] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white">
                Start for free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features" className="hero-cta">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-[4px] bg-white dark:bg-card border-zinc-200 dark:border-border text-foreground hover:bg-zinc-50 dark:hover:bg-muted">
                See how it works
              </Button>
            </Link>
          </div>
          
          {/* Hero Visual Mockups */}
          <div className="relative w-full max-w-5xl mx-auto h-[300px] sm:h-[400px]">
            <div className="hero-card absolute top-10 left-[10%] w-64 bg-white dark:bg-card p-6 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-border rotate-[-6deg] z-10 hidden sm:block text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-100 dark:bg-orange-950/50 p-3 rounded-xl text-orange-600 dark:text-orange-400"><FileText /></div>
                <div className="font-semibold text-zinc-900 dark:text-foreground">Dynamic Form</div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-zinc-100 dark:bg-muted rounded-full"></div>
                <div className="h-2 w-3/4 bg-zinc-100 dark:bg-muted rounded-full"></div>
                <div className="h-8 w-full bg-zinc-50 dark:bg-muted/40 rounded-lg border border-zinc-100 dark:border-border mt-4"></div>
              </div>
            </div>
            
            <div className="hero-card absolute top-0 left-1/2 -translate-x-1/2 w-80 bg-white dark:bg-card p-6 rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-border z-20 text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 dark:bg-blue-950/50 p-3 rounded-xl text-blue-600 dark:text-blue-400"><UploadCloud /></div>
                <div className="font-semibold text-zinc-900 dark:text-foreground">Google Drive Export</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-muted/40 rounded-lg border border-zinc-100 dark:border-border/60">
                  <div className="h-5 w-5 bg-blue-500/20 rounded-md"></div>
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">School/Institution</div>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-muted/40 rounded-lg ml-4 border border-zinc-100 dark:border-border/60">
                  <div className="h-5 w-5 bg-blue-500/20 rounded-md"></div>
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Class & Section</div>
                </div>
                <div className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-muted/40 rounded-lg ml-8 border border-blue-200 dark:border-blue-900/50">
                  <div className="h-5 w-5 bg-green-500/20 rounded-md"></div>
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Roll_No.csv</div>
                </div>
              </div>
            </div>
            
            <div className="hero-card absolute top-16 right-[10%] w-64 bg-white dark:bg-card p-6 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-border rotate-[6deg] z-10 hidden sm:block text-left">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-100 dark:bg-purple-950/50 p-3 rounded-xl text-purple-600 dark:text-purple-400"><Users /></div>
                <div className="font-semibold text-zinc-900 dark:text-foreground">Access Control</div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-border">
                  <div className="text-xs font-medium text-zinc-600 dark:text-muted-foreground">Admin</div>
                  <div className="h-4 w-12 bg-green-100 dark:bg-green-950/50 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-medium text-zinc-600 dark:text-muted-foreground">Employee</div>
                  <div className="h-4 w-12 bg-blue-100 dark:bg-blue-950/50 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
