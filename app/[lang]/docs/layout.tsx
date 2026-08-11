import { source } from "@/lib/source";
// notebook, not layouts/docs: only this one renders a top nav, so the header survives home -> docs.
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { baseOptions } from "@/lib/layout.shared";

export default async function Layout({ children, params }: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;

  return (
    <DocsLayout tree={source.getPageTree(lang)} {...baseOptions(lang)}>
      {children}
    </DocsLayout>
  );
}
