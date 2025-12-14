import { notFound } from 'next/navigation';
import { getMdxBySlug, getMdxSlugs } from '@/lib/mdx';

type PageProps = {
  params: { slug: string };
};

// Make this async to satisfy Next.js type expectations
export async function generateStaticParams() {
  const slugs = await getMdxSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Mark page component as async if getMdxBySlug might fetch data
export default async function ArticlePage({ params }: PageProps) {
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
