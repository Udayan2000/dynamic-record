import Link from "next/link";



export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="flex items-center justify-between px-6 py-5">
        <Link href="/">
          {/* <Logo /> */}
        </Link>
        {/* <ThemeToggle /> */}
      </div>
      <div className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
