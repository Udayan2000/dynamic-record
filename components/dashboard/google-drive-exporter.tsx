"use client";

import { useState } from "react";
import { HardDrive, CloudDownload, RefreshCw, CheckCircle2, Folder, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function GoogleDriveExporter() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>("Today, " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [totalFilesSynced, setTotalFilesSynced] = useState(342);

  // Optimistic handler: provides immediate visual feedback with zero blocking delay
  const handleDownloadAndDriveBackup = () => {
    setIsSyncing(true);
    
    // Instant toast notification for optimistic UX
    toast.info("Preparing data export...", {
      description: "Packaging records and establishing secure Google Drive stream.",
    });

    // Simulated background sync complete
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced("Just now (" + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ")");
      setTotalFilesSynced((prev) => prev + 12);
      
      toast.success("Downloaded & Saved to Admin Google Drive!", {
        description: "All employee upload, edit, and system records stored at /Admin-Dynamic-Records/Backups.",
      });
    }, 1200);
  };

  return (
    <Card className="h-full rounded-lg border border-border bg-card text-card-foreground shadow-sm shadow-none! bg-white flex flex-col justify-between">
      <CardHeader className=" p-2!">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Google Drive Sync & Download Hub</CardTitle>
              <CardDescription className="text-xs text-muted-foreground w-[380px]">
                Admin Exclusive: Download all record data and automatically store/sync in Admin Google Drive.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs px-2 py-0.5 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Connected
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm flex-1 flex flex-col justify-between p-2!">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-md bg-muted/30 border border-border/60">
            <span className="text-muted-foreground block mb-0.5">Target Cloud Storage</span>
            <span className="font-medium flex items-center gap-1.5 text-foreground truncate">
              <Folder className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              /Admin-Dynamic-Records
            </span>
          </div>

          <div className="p-2.5 rounded-md bg-muted/30 border border-border/60">
            <span className="text-muted-foreground block mb-0.5">Last Storage Sync</span>
            <span className="font-medium text-foreground">{lastSynced}</span>
          </div>

          <div className="p-2.5 rounded-md bg-muted/30 border border-border/60">
            <span className="text-muted-foreground block mb-0.5">Total Synced Data</span>
            <span className="font-medium text-foreground">{totalFilesSynced} records</span>
          </div>

          <div className="p-2.5 rounded-md bg-muted/30 border border-border/60">
            <span className="text-muted-foreground block mb-0.5">Access Rights</span>
            <span className="font-medium text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin Full Control
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2">
          <Button
            onClick={handleDownloadAndDriveBackup}
            disabled={isSyncing}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs h-9 cursor-pointer transition-all shadow-none"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Syncing & Saving to Google Drive...
              </>
            ) : (
              <>
                <CloudDownload className="h-4 w-4" />
                Download & Store to Google Drive
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Opening Google Drive...", { description: "Redirecting to /Admin-Dynamic-Records in Google Drive." })}
            className="gap-1.5 text-xs h-9"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open Drive
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
