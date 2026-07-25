import Link from "next/link";
// import { Logo } from "@/components/common/logo";
// import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/">
          {/* <Logo /> */}
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="#features" className="hover:text-foreground">Features</Link>
          <Link href="#workflow" className="hover:text-foreground">Workflow</Link>
          <Link href="#security" className="hover:text-foreground">Security</Link>
        </nav>
        <div className="flex items-center gap-2">
          {/* <ThemeToggle /> */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/login">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}