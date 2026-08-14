import { Hero } from "@/components/Hero";
import { BoilerplateContrast } from "@/components/BoilerplateContrast";
import { BranchTree } from "@/components/BranchTree";
import { FeatureGrid } from "@/components/FeatureGrid";
import { SupportMatrix } from "@/components/SupportMatrix";
import { Comparison } from "@/components/Comparison";
import { ProjectStats } from "@/components/ProjectStats";
import { InstallCommand } from "@/components/InstallCommand";
import { Reveal } from "@/components/Reveal";
import { SectionNav } from "@/components/SectionNav";
import { NPM_URL, REPO_URL } from "@/lib/shared";

// Stats fetches revalidate every 10 minutes (see lib/stats.ts); pinning the route to the
// same window stops static generation from freezing them at build time regardless.
export const revalidate = 600;

export default async function HomePage(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;

  return (
    <main>
      {/* This page's own sections, so the bar belongs to it rather than to the shared layout. */}
      <SectionNav />
      <Hero lang={lang} />
      <Reveal>
        <BoilerplateContrast />
      </Reveal>
      <Reveal>
        <BranchTree />
      </Reveal>
      <Reveal>
        <FeatureGrid />
      </Reveal>
      <Reveal>
        <SupportMatrix />
      </Reveal>
      <Reveal>
        <Comparison />
      </Reveal>
      <Reveal>
        <ProjectStats />
      </Reveal>
      <Reveal>
        <section className="mx-auto flex w-full max-w-(--content-width) flex-col items-center gap-4 px-4 py-16 text-center">
          <p className="text-fd-muted-foreground text-sm">
            Your database. Your rows. No service to sign up for.
          </p>
          <InstallCommand />
          <div className="flex gap-4 text-sm">
            <a
              href={REPO_URL}
              className="text-fd-muted-foreground hover:text-fd-foreground rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live)"
            >
              GitHub
            </a>
            <a
              href={NPM_URL}
              className="text-fd-muted-foreground hover:text-fd-foreground rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--live)"
            >
              npm
            </a>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
