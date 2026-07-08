import { Analytics } from "@/components/analytics";
import { CustomCursor } from "@/components/effects/custom-cursor";
import { KonamiEasterEgg } from "@/components/effects/konami";
import { ScrollProgress } from "@/components/effects/scroll-progress";
import { CommandPalette } from "@/components/navigation/command-palette";
import { Navbar } from "@/components/navigation/navbar";
import { PwaRegister } from "@/components/pwa-register";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Education } from "@/components/sections/education";
import { Experience } from "@/components/sections/experience";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Projects } from "@/components/sections/projects";
import { Skills } from "@/components/sections/skills";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
      <CommandPalette />
      <CustomCursor />
      <KonamiEasterEgg />
      <PwaRegister />
      <Analytics />
      <div className="noise-layer" aria-hidden="true" />
    </>
  );
}
