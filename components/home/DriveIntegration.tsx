"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { Database, Folder, Image as ImageIcon, FileSpreadsheet } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function DriveIntegration() {
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

    tl.from(".di-header", { y: 30, opacity: 0, duration: 0.8 })
      .from(".di-svg-path", { strokeDashoffset: 1000, duration: 2, ease: "power2.inOut" }, "-=0.4")
      .from(".di-app-box", { scale: 0, opacity: 0, duration: 0.6, ease: "back.out(1.7)" }, "-=1.8")
      .from(".di-drive-box", { scale: 0, opacity: 0, duration: 0.6, ease: "back.out(1.7)" }, "-=0.6")
      .from(".di-folder", { x: -20, opacity: 0, stagger: 0.15, duration: 0.5 }, "-=0.2");

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 bg-zinc-900 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto di-header">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Flawless Google Drive Export
          </h2>
          <p className="text-lg text-zinc-400">
            No manual sorting required. We automatically generate a perfectly nested folder structure inside your Google Drive based on your form fields.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Connection Animation SVG */}
          <div className="absolute top-16 bottom-16 left-1/2 -translate-x-1/2 w-1 hidden md:block">
            <svg width="4" height="100%" className="overflow-visible">
              <line 
                x1="2" y1="0" x2="2" y2="100%" 
                stroke="#3b82f6" 
                strokeWidth="4" 
                strokeDasharray="8 8"
                className="di-svg-path"
                style={{ strokeDasharray: "1000", strokeDashoffset: "1000" }}
              />
            </svg>
          </div>

          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-12 md:gap-0">
            
            {/* App Box */}
            <div className="di-app-box w-full md:w-1/3 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 p-8 rounded-3xl text-center relative z-10 shadow-2xl">
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dynamic Record</h3>
              <p className="text-sm text-zinc-400">Raw form submissions and high-res camera photos.</p>
            </div>

            {/* Drive Structure Box */}
            <div className="di-drive-box w-full md:w-[45%] bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 p-8 rounded-3xl relative z-10 shadow-2xl">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-zinc-700">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Google Drive</h3>
                  <p className="text-xs text-zinc-400">Auto-generated hierarchy</p>
                </div>
              </div>

              <div className="space-y-2 font-mono text-sm">
                <div className="di-folder flex items-center text-blue-400 font-bold">
                  <Folder className="w-4 h-4 mr-2" /> TemplateName_Date
                </div>
                <div className="di-folder flex items-center pl-6 text-zinc-300">
                  <Folder className="w-4 h-4 mr-2" /> Institute Name
                </div>
                <div className="di-folder flex items-center pl-12 text-zinc-400">
                  <Folder className="w-4 h-4 mr-2" /> Class
                </div>
                <div className="di-folder flex items-center pl-16 text-zinc-400">
                  <Folder className="w-4 h-4 mr-2" /> Section
                </div>
                <div className="di-folder flex items-center pl-20 text-zinc-400">
                  <Folder className="w-4 h-4 mr-2" /> Roll No.
                </div>
                
                <div className="di-folder flex items-center pl-24 text-emerald-400 mt-2">
                  <Folder className="w-4 h-4 mr-2" /> image/
                </div>
                <div className="di-folder flex items-center pl-28 text-emerald-200/70 text-xs">
                  <ImageIcon className="w-3 h-3 mr-2" /> photo.jpg
                </div>
                
                <div className="di-folder flex items-center pl-24 text-emerald-400 mt-2">
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> data.csv
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
