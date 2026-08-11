import { Hero } from "@/components/Hero";
import { BoilerplateContrast } from "@/components/BoilerplateContrast";
import { BranchTree } from "@/components/BranchTree";
import { FeatureGrid } from "@/components/FeatureGrid";
import { InstallCommand } from "@/components/InstallCommand";
import { Reveal } from "@/components/Reveal";
import { NPM_URL, REPO_URL } from "@/lib/shared";

export default async function HomePage(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;

  return (
    <main>
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
