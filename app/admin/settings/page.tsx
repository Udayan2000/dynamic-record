"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/services/admin-services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Key, Lock } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: adminApi.getProfile,
  });

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const mutation = useMutation({
    mutationFn: adminApi.updateGoogleDriveCredentials,
    onSuccess: () => {
      toast.success("Google Drive credentials updated!");
      queryClient.invalidateQueries({ queryKey: ["adminProfile"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update credentials");
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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasCredentials = profile?.googleDriveCredentials?.clientId && profile?.googleDriveCredentials?.clientSecret;

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and integrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.01 17.561l-2.022 3.511h11.977l-1.954-3.511H12.01zM18.995 16.326L13.111 6.13H9.202l5.885 10.196h3.908zM10.871 6.13L5.05 16.21 6.94 19.5l5.885-10.197L10.871 6.13z" fill="#000000"/>
            </svg>
            Google Drive Integration
          </CardTitle>
          <CardDescription>
            Connect your own Google Drive account to export records directly to your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing && hasCredentials ? (
            <div className="rounded-lg bg-green-50 p-4 border border-green-100 flex items-start justify-between">
              <div>
                <p className="font-medium text-green-900">Google Drive is connected</p>
                <p className="text-sm text-green-700 mt-1">Your OAuth credentials are securely stored and ready for exports.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleEdit} className="bg-white border-green-200 text-green-700 hover:bg-green-50">
                Update Keys
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId" className="flex items-center gap-1.5"><Key className="w-4 h-4 text-zinc-400" /> Client ID</Label>
                <Input 
                  id="clientId"
                  placeholder="Enter your Google OAuth Client ID"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientSecret" className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-zinc-400" /> Client Secret</Label>
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
        {isEditing || !hasCredentials ? (
          <CardFooter className="flex justify-end gap-3 border-t bg-zinc-50/50 py-4">
            {hasCredentials && (
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            )}
            <Button onClick={handleSave} disabled={mutation.isPending || !clientId || !clientSecret}>
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Credentials
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
