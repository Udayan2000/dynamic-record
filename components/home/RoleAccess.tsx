"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { ShieldCheck, UserCog, UserCheck, Key } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function RoleAccess() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 60%",
        end: "bottom 80%",
        toggleActions: "play none none reverse",
      }
    });

    tl.from(".ra-header", { y: 30, opacity: 0, duration: 0.8 })
      .from(".ra-card-admin", { x: -50, opacity: 0, rotationY: 45, duration: 0.8 }, "-=0.4")
      .from(".ra-card-employee", { x: 50, opacity: 0, rotationY: -45, duration: 0.8 }, "-=0.6");

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16 max-w-3xl mx-auto ra-header">
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 text-purple-600 rounded-2xl mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-6">
            Strict Role-Based Access
          </h2>
          <p className="text-lg text-zinc-600">
            Control exactly who can create templates and who can only submit records. Security and organization built right in.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto perspective-1000">
          
          {/* Admin Card */}
          <div className="ra-card-admin flex-1 bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 hover:border-purple-300 transition-colors">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                <UserCog className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-900">Admins</h3>
                <p className="text-sm text-zinc-500">Full control over the system</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                "Create and modify dynamic templates",
                "Assign templates to specific employees",
                "Link system to Google Drive account",
                "Export and manage all collected records",
                "Activate or deactivate templates instantly"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-700 font-medium">
                  <Key className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Employee Card */}
          <div className="ra-card-employee flex-1 bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 hover:border-blue-300 transition-colors">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-zinc-900">Employees</h3>
                <p className="text-sm text-zinc-500">Focused data collection</p>
              </div>
            </div>
            <ul className="space-y-4">
              {[
                "View only assigned templates",
                "Submit records and capture photos",
                "Simple, distraction-free dashboard",
                "Cannot edit templates or settings",
                "No access to Google Drive credentials"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-700 font-medium">
                  <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
