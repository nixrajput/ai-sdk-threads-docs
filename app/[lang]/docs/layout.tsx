import { source } from "@/lib/source";
// notebook with nav.mode 'top': one full-width bar above the sidebar, so the header is the
// same object on home, playground and every docs page.
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { baseOptions } from "@/lib/layout.shared";

export default async function Layout({ children, params }: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;

  const base = baseOptions(lang);

  return (
    <DocsLayout tree={source.getPageTree(lang)} {...base} nav={{ ...base.nav, mode: "top" }}>
      {children}
    </DocsLayout>
  );
}
