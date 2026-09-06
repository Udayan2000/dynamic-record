"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { GraduationCap, Building2, HardHat } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function UseCases() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const sections = gsap.utils.toArray(".uc-card");
    
    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => "+=" + scrollRef.current?.offsetWidth
      }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="use-cases" className="bg-zinc-900 text-white overflow-hidden h-screen flex flex-col justify-center">
      <div className="container mx-auto px-6 max-w-7xl mb-12">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Built for Every Industry</h2>
        <p className="text-zinc-400 text-lg max-w-2xl">Scroll to see how different organizations use Dynamic Record to streamline their workflows.</p>
      </div>

      <div className="overflow-hidden">
        <div ref={scrollRef} className="flex w-[300vw] h-[50vh] md:h-[60vh]">
          
          {/* Case 1 */}
          <div className="uc-card w-screen h-full px-6 flex items-center justify-center">
            <div className="w-full max-w-5xl bg-zinc-800 rounded-3xl p-8 md:p-12 border border-zinc-700 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center shrink-0">
                <GraduationCap className="w-12 h-12 md:w-16 md:h-16" />
              </div>
              <div>
                <h3 className="text-2xl md:text-4xl font-bold mb-4">Schools & Universities</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Teachers collect student assignments, lab photos, and ID cards. The system automatically creates a Google Drive folder for each Class, Section, and Roll Number, placing the student's photo right where it belongs.
                </p>
              </div>
            </div>
          </div>

          {/* Case 2 */}
          <div className="uc-card w-screen h-full px-6 flex items-center justify-center">
            <div className="w-full max-w-5xl bg-zinc-800 rounded-3xl p-8 md:p-12 border border-zinc-700 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shrink-0">
                <Building2 className="w-12 h-12 md:w-16 md:h-16" />
              </div>
              <div>
                <h3 className="text-2xl md:text-4xl font-bold mb-4">Corporate HR</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  HR managers assign templates to new employees for onboarding. Employees upload their ID documents and fill out details. Everything is securely exported to the company's Google Drive under strict access controls.
                </p>
              </div>
            </div>
          </div>

          {/* Case 3 */}
          <div className="uc-card w-screen h-full px-6 flex items-center justify-center">
            <div className="w-full max-w-5xl bg-zinc-800 rounded-3xl p-8 md:p-12 border border-zinc-700 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center shrink-0">
                <HardHat className="w-12 h-12 md:w-16 md:h-16" />
              </div>
              <div>
                <h3 className="text-2xl md:text-4xl font-bold mb-4">Field Inspections</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Site engineers use the mobile-friendly web app to take photos of construction progress, fill out inspection forms, and submit them instantly. Admins get organized, date-stamped folders in the cloud automatically.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
