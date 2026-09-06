import React from 'react';
import { Navbar } from '@/components/home/Navbar';
import { Hero } from '@/components/home/Hero';
import { ProblemSolution } from '@/components/home/ProblemSolution';
import { TemplateBuilder } from '@/components/home/TemplateBuilder';
import { DriveIntegration } from '@/components/home/DriveIntegration';
import { RoleAccess } from '@/components/home/RoleAccess';
import { UseCases } from '@/components/home/UseCases';
import { Pricing } from '@/components/home/Pricing';
import { FooterCTA } from '@/components/home/FooterCTA';

export const metadata = {
  title: "Dynamic Record - SaaS Homepage",
  description: "Unify Your Data Collection with Dynamic Templates and Google Drive Integration.",
};

const Page = () => {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-blue-200">
      <Navbar />
      
      <main>
        {/* Screen 1 */}
        <Hero />
        
        {/* Screen 2 */}
        <ProblemSolution />
        
        {/* Screen 3 */}
        <TemplateBuilder />
        
        {/* Screen 4 */}
        <DriveIntegration />
        
        {/* Screen 5 */}
        <RoleAccess />
        
        {/* Screen 6 */}
        <UseCases />
        
        {/* Screen 7 */}
        <Pricing />
      </main>

      {/* Screen 8 (Footer) */}
      <FooterCTA />
    </div>
  );
}

export default Page;