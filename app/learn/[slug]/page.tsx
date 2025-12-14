import { notFound } from 'next/navigation';
import { getMdxBySlug, getMdxSlugs } from '@/lib/mdx';

// Return a Promise array — Next.js expects async generateStaticParams
export async function generateStaticParams() {
  const slugs = await getMdxSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Let Next.js infer the PageProps type
export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const mdx = await getMdxBySlug(params.slug);
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
