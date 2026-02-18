import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { LeagueSystem } from "@/components/LeagueSystem";
import { FAQ } from "@/components/FAQ";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <div className="cursor-glow" id="cursorGlow" aria-hidden="true" />
      <Nav />
      <Hero />
      <HowItWorks />
      <Pricing />
      <LeagueSystem />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
