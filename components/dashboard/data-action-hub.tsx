"use client";

import { useState } from "react";
import { UploadCloud, Edit3, Eye, Trash2, HardDrive, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Role } from "@/types";

interface DataActionHubProps {
  role: Role;
}

export function DataActionHub({ role }: DataActionHubProps) {
  const isAdmin = role === "admin";
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = (actionName: string, allowed: boolean) => {
    if (!allowed) {
      toast.error("Action Restricted", {
        description: `Only Admin can perform '${actionName}'. Regular users can Upload, Edit, and View data.`,
      });
      return;
    }

    setActiveAction(actionName);

    // Optimistic instant feedback
    toast.success(`${actionName} Initiated`, {
      description: `Optimistic action trigger complete for ${actionName}.`,
    });

    setTimeout(() => {
      setActiveAction(null);
    }, 600);
  };

  const ACTIONS = [
    {
      title: "Upload Data",
      description: "Upload & submit new dynamic forms or batch records",
      icon: UploadCloud,
      allowed: true, // Both Admin and Employee
      roleBadge: "Admin & User",
      color: "text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200",
    },
    {
      title: "Edit Data",
      description: "Update existing record fields, values, and templates",
      icon: Edit3,
      allowed: true, // Both Admin and Employee
      roleBadge: "Admin & User",
      color: "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200",
    },
    {
      title: "View Data",
      description: "Browse dynamic records, search & inspect submissions",
      icon: Eye,
      allowed: true, // Both Admin and Employee
      roleBadge: "Admin & User",
      color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
    },
    {
      title: "Delete Data",
      description: "Purge & delete selected records permanently",
      icon: Trash2,
      allowed: isAdmin, // Only Admin
      roleBadge: isAdmin ? "Admin Only" : "Admin Restricted",
      color: isAdmin
        ? "text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200"
        : "text-slate-400 bg-slate-50 border-slate-200 opacity-75 cursor-not-allowed",
    },
    {
      title: "Google Drive Sync",
      description: "Download & auto-sync complete data to Admin Google Drive",
      icon: HardDrive,
      allowed: isAdmin, // Only Admin
      roleBadge: isAdmin ? "Admin Only" : "Admin Restricted",
      color: isAdmin
        ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
        : "text-slate-400 bg-slate-50 border-slate-200 opacity-75 cursor-not-allowed",
    },
  ];

  return (
    <Card className="w-full brounded-lg border border-border text-card-foreground shadow-sm shadow-none! bg-white mt-2 p-2!">
      <CardHeader className="p-0 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Quick Action Hub</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Perform instant operations based on your role privileges ({isAdmin ? "Admin" : "User / Employee"}).
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs capitalize font-medium">
            Active Role: {role}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0!">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {ACTIONS.map((item) => {
            const Icon = item.icon;
            const isProcessing = activeAction === item.title;

            return (
              <div
                key={item.title}
                onClick={() => handleAction(item.title, item.allowed)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between h-32 ${item.color} shadow-xs hover:shadow-sm`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className="h-5 w-5" />
                    {!item.allowed ? (
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                  </div>
                  <h4 className="font-semibold text-xs text-foreground mb-0.5">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-black/5 mt-1">
                  <span className="text-[10px] font-medium opacity-80">{item.roleBadge}</span>
                  <ArrowRight className={`h-3 w-3 transition-transform ${isProcessing ? "translate-x-1" : ""}`} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
