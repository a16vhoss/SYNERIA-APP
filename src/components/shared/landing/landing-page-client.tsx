"use client";

import { LandingNav } from "./landing-nav";
import { HeroSection } from "./hero-section";
import { StatsSection } from "./stats-section";
import { FeaturesSection } from "./features-section";
import { SectorsSection } from "./sectors-section";
import { HowItWorksSection } from "./how-it-works-section";
import { TestimonialsSection } from "./testimonials-section";
import { CtaSection } from "./cta-section";
import { LandingFooter } from "./landing-footer";

export function LandingPageClient() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <LandingNav />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <SectorsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
