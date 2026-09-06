"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function FooterCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom bottom",
        toggleActions: "play none none reverse",
      }
    });

    tl.from(".fc-content", { y: 50, opacity: 0, duration: 1, ease: "power3.out" })
      .from(".fc-footer", { opacity: 0, duration: 1 }, "-=0.5");

  }, { scope: sectionRef });

  return (
    <footer ref={sectionRef} className="bg-zinc-950 text-white pt-24 pb-8 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="fc-content flex flex-col items-center text-center border-b border-zinc-800 pb-20 mb-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 max-w-3xl leading-tight">
            Ready to unify your records?
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-xl">
            Join the organizations using Dynamic Record to structure their chaos and automate their Google Drive uploads.
          </p>
          <Link href="/login">
            <Button size="lg" className="h-14 px-8 text-lg rounded-xl bg-white text-zinc-900 hover:bg-zinc-200 hover:-translate-y-1 transition-all">
              Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        <div className="fc-footer flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-white text-zinc-900 p-1.5 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Dynamic Record</span>
          </div>
          
          <div className="flex gap-6 text-sm text-zinc-500 font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
          
          <div className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Dynamic Record. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
