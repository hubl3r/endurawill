import { notFound } from 'next/navigation';
import { getMdxBySlug, getMdxSlugs } from '@/lib/mdx';

// Async function returning a Promise array
export async function generateStaticParams() {
  const slugs = await getMdxSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Page component must be async if using async data fetching
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
