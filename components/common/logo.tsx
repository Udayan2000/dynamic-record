import Link from "next/link";
import { Layers } from "lucide-react";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2.5 group ${className || ""}`}>
      <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
        <Layers className="w-4 h-4" />
      </div>
      <span className="font-bold tracking-tight text-foreground text-base">Dynamic Record</span>
    </Link>
  );
}
