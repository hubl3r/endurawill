// lib/mdx.ts
import WhatIsAWT from '../content/learn/what-is-a-last-will-and-testament.mdx';

type MDXComponent = (props: any) => JSX.Element; // Adjust if you have MDXProps type

export const mdxArticles: Record<string, MDXComponent> = {
  'what-is-a-last-will-and-testament': WhatIsAWT,
};

export function getMdxSlugs() {
  return Object.keys(mdxArticles);
}

export async function getMdxBySlug(slug: string) {
  const Content = mdxArticles[slug];
  if (!Content) return null;
  // MDX metadata can still be exported from the MDX file
  const { metadata } = Content as any;
  return { Content, metadata };
}
