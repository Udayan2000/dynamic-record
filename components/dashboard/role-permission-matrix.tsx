"use client";

import { Check, X, Shield, User, HardDrive, UploadCloud, Edit3, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RolePermissionMatrix() {
  const PERMISSIONS = [
    {
      feature: "Upload Data",
      icon: UploadCloud,
      admin: true,
      user: true,
      description: "Submit new dynamic records into system",
    },
    {
      feature: "Edit Data",
      icon: Edit3,
      admin: true,
      user: true,
      description: "Modify existing records and template fields",
    },
    {
      feature: "View Data",
      icon: Eye,
      admin: true,
      user: true,
      description: "Browse and inspect stored records",
    },
    {
      feature: "Delete Data",
      icon: Trash2,
      admin: true,
      user: false,
      description: "Permanently purge records from system",
    },
    {
      feature: "Google Drive Backup & Download",
      icon: HardDrive,
      admin: true,
      user: false,
      description: "Download & auto-store all dataset in Admin Drive",
    },
  ];

  return (
    <Card className="h-full rounded-lg border border-border bg-card text-card-foreground shadow-sm shadow-none! bg-white flex flex-col justify-between">
      <CardHeader className="p-2!">
        
         

          <div className="flex items-center justify-between">
            <div className="flex items-start gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold"> Role Access & Permission Controls</CardTitle>
                <CardDescription className="text-xs text-muted-foreground w-[380px]">
                  Comparative matrix detailing capabilities of Admin vs Standard User.
                </CardDescription>
              </div>
            </div>
          </div>
        
      </CardHeader>

      <CardContent className="space-y-2 flex-1 flex flex-col justify-between p-2">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-medium">
                <th className="py-2 px-2">Capability</th>
                <th className="py-2 px-2 text-center w-20">
                  <span className="flex items-center justify-center gap-1 font-semibold text-primary">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                </th>
                <th className="py-2 px-2 text-center w-20">
                  <span className="flex items-center justify-center gap-1 font-medium text-muted-foreground">
                    <User className="h-3 w-3" /> User
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {PERMISSIONS.map((p) => {
                const Icon = p.icon;
                return (
                  <tr key={p.feature} className="hover:bg-muted/10 transition-colors">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-foreground text-xs">{p.feature}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{p.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-2 text-center">
                      {p.admin ? (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-2 text-center">
                      {p.user ? (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
