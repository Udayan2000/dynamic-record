"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { PlusCircle, LayoutTemplate, FormInput, Type, List, CheckSquare } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function TemplateBuilder() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 60%",
        end: "bottom 80%",
        toggleActions: "play none none reverse",
      }
    });

    tl.from(".tb-header", { y: 30, opacity: 0, duration: 0.8 })
      .from(".tb-sidebar-item", { x: -30, opacity: 0, stagger: 0.1, duration: 0.5 }, "-=0.4")
      .from(".tb-builder-area", { scale: 0.95, opacity: 0, duration: 0.6 }, "-=0.2")
      .from(".tb-field", { y: 20, opacity: 0, stagger: 0.15, duration: 0.6 }, "-=0.2");
      
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-zinc-50 relative border-y border-zinc-200/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16 max-w-3xl mx-auto tb-header">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-6">
            <LayoutTemplate className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 mb-6">
            Build Templates Your Way
          </h2>
          <p className="text-lg text-zinc-600">
            Create custom data collection forms instantly. Need to collect student rolls, employee IDs, or site photos? Just add a field.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
          {/* Sidebar Mockup */}
          <div className="w-full lg:w-1/3 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6">Field Types</h4>
            <div className="space-y-3">
              {[
                { icon: <Type size={18} />, label: "Short Text" },
                { icon: <FormInput size={18} />, label: "Long Text" },
                { icon: <List size={18} />, label: "Dropdown" },
                { icon: <CheckSquare size={18} />, label: "Checkboxes" },
              ].map((item, i) => (
                <div key={i} className="tb-sidebar-item flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer text-zinc-700 font-medium">
                  <div className="text-zinc-400">{item.icon}</div>
                  {item.label}
                  <PlusCircle size={16} className="ml-auto text-blue-500 opacity-50" />
                </div>
              ))}
            </div>
          </div>

          {/* Builder Area Mockup */}
          <div className="tb-builder-area w-full lg:w-2/3 bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl shadow-zinc-200/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-100">
              <h3 className="text-xl font-bold text-zinc-800">Student Enrollment Form</h3>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wide">Active</div>
            </div>

            <div className="space-y-6">
              <div className="tb-field group relative">
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                <div className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-lg" />
              </div>
              
              <div className="tb-field group relative flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Class</label>
                  <div className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center px-3 justify-between">
                    <span className="text-zinc-400 text-sm">Select class...</span>
                    <div className="w-4 h-4 text-zinc-300">▼</div>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-zinc-700 mb-2">Roll No</label>
                  <div className="w-full h-10 bg-zinc-50 border border-zinc-200 rounded-lg" />
                </div>
              </div>

              <div className="tb-field group relative border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                </div>
                <p className="text-sm font-medium text-blue-900">Student Photo Required</p>
                <p className="text-xs text-blue-600/70 mt-1">Camera access enabled for this template</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
