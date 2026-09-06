"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { Layers } from "lucide-react";

export function Navbar() {
  const navRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 0.2,
    });
  });

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-zinc-200/50">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform">
          <Layers className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-zinc-900">Dynamic Record</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
        <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
        <Link href="#use-cases" className="hover:text-primary transition-colors">Use Cases</Link>
        <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost" className="font-semibold text-zinc-600 hover:text-zinc-900">Log in</Button>
        </Link>
        <Link href="/login">
          <Button className="font-semibold shadow-md hover:shadow-lg transition-shadow">Get Started</Button>
        </Link>
      </div>
    </nav>
  );
}
