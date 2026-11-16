"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { Layers } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";

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
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 dark:bg-card/80 backdrop-blur-md border-b border-border shadow-xs">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
          <Layers className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">Dynamic Record</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
        <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
        <Link href="#use-cases" className="hover:text-primary transition-colors">Use Cases</Link>
        <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/login">
          <Button variant="ghost" className="font-semibold text-muted-foreground hover:text-foreground">Log in</Button>
        </Link>
        <Link href="/login">
          <Button className="font-semibold shadow-xs hover:shadow-md transition-shadow">Get Started</Button>
        </Link>
      </div>
    </nav>
  );
}
