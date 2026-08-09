import { Hero } from "@/components/Hero";
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
        <FeatureGrid />
      </Reveal>
      <Reveal>
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 border-t border-(--line) px-4 py-8 text-center">
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
