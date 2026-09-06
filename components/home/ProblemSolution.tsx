"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ProblemSolution() {
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

    tl.from(".ps-title", { y: 30, opacity: 0, duration: 0.8 })
      .from(".ps-subtitle", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(".ps-card-chaos", { x: -50, opacity: 0, duration: 0.8 }, "-=0.4")
      .from(".ps-card-order", { x: 50, opacity: 0, duration: 0.8 }, "-=0.6")
      .from(".ps-arrow", { scale: 0, opacity: 0, duration: 0.5, ease: "back.out(1.7)" }, "-=0.4");

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="ps-title text-3xl md:text-5xl font-bold text-zinc-900 mb-6">
            Tired of scattered spreadsheets and lost photos?
          </h2>
          <p className="ps-subtitle text-lg text-zinc-600">
            Collecting data manually from multiple sources leads to chaos. We transform that chaos into a perfectly structured system.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 relative">
          
          {/* Chaos Card */}
          <div className="ps-card-chaos w-full max-w-md bg-red-50/50 border border-red-100 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <AlertTriangle className="w-32 h-32 text-red-500" />
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-red-950">The Old Way</h3>
            </div>
            <ul className="space-y-4 relative z-10 text-red-900/80 font-medium">
              <li className="flex items-start gap-3">
                <span className="mt-1 block w-2 h-2 rounded-full bg-red-400 shrink-0" />
                Photos sent via WhatsApp or Email
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block w-2 h-2 rounded-full bg-red-400 shrink-0" />
                Data typed manually into endless spreadsheets
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block w-2 h-2 rounded-full bg-red-400 shrink-0" />
                Missing attachments and broken links
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block w-2 h-2 rounded-full bg-red-400 shrink-0" />
                No access control or role management
              </li>
            </ul>
          </div>

          {/* Arrow */}
          <div className="ps-arrow hidden lg:flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 z-10 shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>

          {/* Order Card */}
          <div className="ps-card-order w-full max-w-md bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-emerald-900/5">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <CheckCircle2 className="w-32 h-32 text-emerald-500" />
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-emerald-950">Dynamic Record</h3>
            </div>
            <ul className="space-y-4 relative z-10 text-emerald-900/80 font-medium">
              <li className="flex items-start gap-3">
                <span className="mt-1 block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                Custom forms designed exactly for your needs
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                Direct camera uploads linked to records
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                Automated nested folders in Google Drive
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 block w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                Strict Admin and Employee access controls
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
