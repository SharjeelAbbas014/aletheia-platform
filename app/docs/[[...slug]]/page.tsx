import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle
} from "fumadocs-ui/page";

import { source } from "@/lib/source";
import { useMDXComponents } from "@/mdx-components";

type DocPageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export async function generateStaticParams() {
  return source.generateParams();
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  const pageData = page.data as unknown as {
    title: string;
    description?: string;
    full?: boolean;
    toc?: any;
    body: ComponentType<{
      components?: ReturnType<typeof useMDXComponents>;
    }>;
  };
  const MDX = pageData.body;

  return (
    <DocsPage toc={pageData.toc as any} full={pageData.full}>
      <DocsTitle>{pageData.title}</DocsTitle>
      {pageData.description ? (
        <DocsDescription>{pageData.description}</DocsDescription>
      ) : null}
      <DocsBody>
        <MDX components={useMDXComponents({})} />
      </DocsBody>
    </DocsPage>
  );
}
