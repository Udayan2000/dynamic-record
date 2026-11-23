"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/services/admin-services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Key, Lock, Copy, Check, CheckCircle2, AlertCircle, LogOut, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: adminApi.getProfile,
  });

  const { data: driveStatus, refetch: refetchDriveStatus } = useQuery({
    queryKey: ["googleDriveStatus"],
    queryFn: async () => {
      const res = await fetch("/api/auth/google/status");
      return res.json();
    },
  });

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [redirectUri, setRedirectUri] = useState("");
  const [copiedUri, setCopiedUri] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectUri(`${window.location.origin}/api/auth/callback/google`);
    }
  }, []);

  const mutation = useMutation({
    mutationFn: adminApi.updateGoogleDriveCredentials,
    onSuccess: () => {
      toast.success("Google Drive credentials updated!");
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
      queryClient.invalidateQueries({ queryKey: ["googleDriveStatus"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update credentials");
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/google/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect Google Drive");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Google Drive disconnected. You can now connect a new Google account.");
      queryClient.invalidateQueries({ queryKey: ["googleDriveStatus"] });
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to disconnect Google Drive");
    }
  });

  const handleSave = () => {
    mutation.mutate({ clientId, clientSecret });
  };

  const handleEdit = () => {
    setClientId(profile?.googleDriveCredentials?.clientId || "");
    setClientSecret(profile?.googleDriveCredentials?.clientSecret || "");
    setIsEditing(true);
  };

  const handleCopyUri = () => {
    if (!redirectUri) return;
    navigator.clipboard.writeText(redirectUri);
    setCopiedUri(true);
    toast.success("Redirect URI copied to clipboard");
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleConnectOrSwitch = () => {
    window.location.href = `/api/auth/google?returnUrl=${encodeURIComponent('/admin/settings')}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasCredentials = Boolean(
    profile?.googleDriveCredentials?.clientId && profile?.googleDriveCredentials?.clientSecret
  );
  const connectedEmail = driveStatus?.connectedEmail || profile?.googleDriveCredentials?.connectedEmail || "";
  const isAuthorized = Boolean(driveStatus?.isConnected);

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
          Manage your account settings, Google Drive export integration, and authorized credentials.
        </p>
      </div>

      <Card className="border border-border shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-foreground shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.01 17.561l-2.022 3.511h11.977l-1.954-3.511H12.01zM18.995 16.326L13.111 6.13H9.202l5.885 10.196h3.908zM10.871 6.13L5.05 16.21 6.94 19.5l5.885-10.197L10.871 6.13z"/>
              </svg>
              Google Drive Integration
            </CardTitle>
            {hasCredentials && (
              <Badge variant={isAuthorized ? "default" : "outline"} className="text-xs">
                {isAuthorized ? "Active & Authorized" : "Keys Set (Authorization Required)"}
              </Badge>
            )}
          </div>
          <CardDescription>
            Connect your Google Cloud OAuth app to export records directly into your chosen Google Drive account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Active Connection Status Card */}
          {hasCredentials && !isEditing && (
            <div className="rounded-lg bg-card border border-border p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${isAuthorized ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}`} />
                    <p className="font-semibold text-sm text-foreground">
                      {isAuthorized ? "Google Drive Connected" : "Credentials Ready"}
                    </p>
                  </div>
                  {connectedEmail ? (
                    <p className="text-xs text-muted-foreground mt-1">
                      Currently exporting to: <strong className="text-foreground font-mono">{connectedEmail}</strong>
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">
                      No Google account authorized yet. Click &quot;Connect Google Account&quot; to authorize.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleConnectOrSwitch}
                    className="cursor-pointer gap-1.5"
                    title="Choose which Google Account to export to"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{isAuthorized ? "Switch Google Account" : "Connect Google Account"}</span>
                  </Button>

                  {isAuthorized && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => disconnectMutation.mutate()}
                      disabled={disconnectMutation.isPending}
                      className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                      title="Disconnect and remove saved tokens"
                    >
                      {disconnectMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                      <span>Disconnect</span>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="cursor-pointer"
                  >
                    Edit Keys
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* OAuth Redirect URI Helper Card */}
          <div className="rounded-lg bg-muted/40 border border-border/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-primary" /> Authorized Redirect URI
              </span>
              <span className="text-[11px] text-muted-foreground">For Google Cloud Console</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Add this exact URI to your Google Cloud OAuth Client under <strong>Authorized redirect URIs</strong> (works on localhost & live domain):
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={redirectUri}
                className="h-8 text-xs font-mono bg-background select-all"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyUri}
                className="h-8 px-2.5 shrink-0 cursor-pointer gap-1.5"
              >
                {copiedUri ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedUri ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          {/* Client ID and Secret inputs */}
          {(isEditing || !hasCredentials) && (
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="clientId" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-muted-foreground" /> Client ID <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="clientId"
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="clientSecret" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-muted-foreground" /> Client Secret <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="clientSecret"
                  type="password"
                  placeholder="Enter your Google OAuth Client Secret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>

        {(isEditing || !hasCredentials) && (
          <CardFooter className="flex justify-end gap-2.5 border-t border-border bg-muted/20 py-3.5">
            {hasCredentials && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={mutation.isPending || !clientId.trim() || !clientSecret.trim()}>
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
              Save Credentials
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
