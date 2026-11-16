"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for PWA
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker registered:", registration.scope);
          })
          .catch((error) => {
            console.error("PWA Service Worker registration failed:", error);
          });
      });
    }

    // 2. Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem("pwa_install_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  return (
    <>
      {children}

      {/* Mobile-friendly PWA Install Prompt Banner */}
      {showInstallBanner && (
        <aside
          role="dialog"
          aria-label="Install App"
          className="fixed bottom-2.5 left-2.5 right-2.5 z-50 md:bottom-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-lg shadow-lg p-2.5 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-[4px] bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-xs">
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-foreground truncate">Install Dynamic Record</h4>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">Install on phone for offline access.</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" onClick={handleInstallClick} className="h-7 sm:h-8 text-xs px-2 sm:px-2.5 shadow-xs">
              Install
            </Button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="h-7 w-7 sm:h-8 sm:w-8 inline-flex items-center justify-center rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
