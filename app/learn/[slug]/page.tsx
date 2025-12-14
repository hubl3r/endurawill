import { notFound } from 'next/navigation';
import { getMdxBySlug, getMdxSlugs } from '@/lib/mdx';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return getMdxSlugs().map((slug) => ({ slug }));
}

export default function ArticlePage({ params }: PageProps) {
  const mdx = getMdxBySlug(params.slug);
  if (!mdx) notFound();

  const { Content, metadata } = mdx;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{metadata.title}</h1>
      <div className="prose max-w-none">
        <Content />
      </div>
    </main>
  );
}
