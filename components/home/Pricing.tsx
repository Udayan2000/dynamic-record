"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        end: "bottom 80%",
        toggleActions: "play none none reverse",
      }
    });

    tl.from(".pr-header", { y: 30, opacity: 0, duration: 0.8 })
      .from(".pr-card", { y: 50, opacity: 0, stagger: 0.2, duration: 0.8, ease: "back.out(1.2)" }, "-=0.4");

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="pricing" className="py-24 bg-zinc-50 dark:bg-background relative transition-colors">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16 max-w-3xl mx-auto pr-header">
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-foreground mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-zinc-600 dark:text-muted-foreground">
            Start for free, upgrade when you need more power and custom Google Drive exports.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto items-center lg:items-stretch">
          
          {/* Starter Plan */}
          <div className="pr-card flex-1 w-full max-w-sm bg-white dark:bg-card border border-zinc-200 dark:border-border rounded-3xl p-8 shadow-xs flex flex-col">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-foreground mb-2">Starter</h3>
            <p className="text-sm text-zinc-500 dark:text-muted-foreground mb-6">Perfect for small teams getting started.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-foreground">$0</span>
              <span className="text-zinc-500 dark:text-muted-foreground font-medium">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {["Up to 3 Templates", "100 Records/month", "Basic Form Builder", "Standard Support"].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> {feat}
                </li>
              ))}
              {["Google Drive Export", "Role-Based Access"].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-400 dark:text-muted-foreground">
                  <X className="w-5 h-5 text-zinc-300 dark:text-muted-foreground/60 shrink-0" /> {feat}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full h-12 rounded-[4px] font-semibold">Get Started</Button>
          </div>

          {/* Pro Plan */}
          <div className="pr-card flex-1 w-full max-w-sm bg-zinc-900 dark:bg-card border border-zinc-800 dark:border-primary/40 rounded-3xl p-8 shadow-2xl relative flex flex-col transform lg:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white dark:text-foreground mb-2">Professional</h3>
            <p className="text-sm text-zinc-400 dark:text-muted-foreground mb-6">For organizations that need full control.</p>
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-white dark:text-foreground">$29</span>
              <span className="text-zinc-400 dark:text-muted-foreground font-medium">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Unlimited Templates", 
                "Unlimited Records", 
                "Google Drive Automated Exports", 
                "Strict Admin & Employee Roles",
                "Advanced Form Builder",
                "Priority Support"
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300 dark:text-zinc-300">
                  <Check className="w-5 h-5 text-blue-400 shrink-0" /> {feat}
                </li>
              ))}
            </ul>
            <Button className="w-full h-12 rounded-[4px] font-semibold">Upgrade to Pro</Button>
          </div>

        </div>
      </div>
    </section>
  );
}
