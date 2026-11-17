"use client";

import { useEffect, useState } from "react";
import { Download, X, WifiOff, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registrationWaiting, setRegistrationWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // 1. Initial network state check
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
        setShowOnlineToast(true);
        setTimeout(() => setShowOnlineToast(false), 3500);
      };

      const handleOffline = () => {
        setIsOffline(true);
        setShowOnlineToast(false);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 2. Check if already running in standalone PWA mode
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;

      // 3. Register Service Worker with update detection
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
              // Check for pending updates
              if (registration.waiting) {
                setRegistrationWaiting(registration.waiting);
                setUpdateAvailable(true);
              }

              registration.addEventListener("updatefound", () => {
                const installingWorker = registration.installing;
                if (!installingWorker) return;

                installingWorker.addEventListener("statechange", () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    setRegistrationWaiting(installingWorker);
                    setUpdateAvailable(true);
                  }
                });
              });
            })
            .catch((error) => {
              console.warn("PWA Service Worker registration skipped:", error);
            });
        });
      }

      // 4. Listen for PWA install prompt (only if not standalone)
      const handleBeforeInstallPrompt = (e: Event) => {
        if (isStandalone) return;
        e.preventDefault();
        setDeferredPrompt(e);
        const dismissed = localStorage.getItem("pwa_install_dismissed");
        if (!dismissed) {
          setShowInstallBanner(true);
        }
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
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

  const handleUpdateApp = () => {
    if (registrationWaiting) {
      registrationWaiting.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  return (
    <>
      {/* Offline Status Pill Notification */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-2.5 left-3 right-3 sm:left-auto sm:right-4 z-50 bg-amber-600/95 dark:bg-amber-600/90 text-white rounded-lg shadow-lg px-3.5 py-2 flex items-center justify-between gap-3 text-xs backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 shrink-0 text-amber-200" />
            <span className="font-medium">You are offline. Cached records and features remain accessible.</span>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="underline hover:no-underline font-semibold text-white cursor-pointer shrink-0 text-[11px]"
          >
            Retry
          </button>
        </aside>
      )}

      {/* Back Online Reconnect Toast */}
      {showOnlineToast && !isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-2.5 left-3 right-3 sm:left-auto sm:right-4 z-50 bg-emerald-600/95 text-white rounded-lg shadow-lg px-3.5 py-2 flex items-center gap-2.5 text-xs backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <Wifi className="h-4 w-4 shrink-0 text-emerald-200" />
          <span className="font-medium">Back online! Network connection restored.</span>
        </aside>
      )}

      {/* App Update Available Notification */}
      {updateAvailable && (
        <aside
          role="dialog"
          aria-label="App update available"
          className="fixed top-12 left-3 right-3 sm:left-auto sm:right-4 z-50 bg-card border border-primary/40 rounded-lg shadow-xl px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2 text-foreground">
            <RefreshCw className="h-3.5 w-3.5 text-primary shrink-0 animate-spin" />
            <span className="font-medium">New version available!</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleUpdateApp} className="h-7 text-xs px-2.5 shadow-xs">
              Reload
            </Button>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </aside>
      )}

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
              <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">Install on phone for quick offline access.</p>
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
