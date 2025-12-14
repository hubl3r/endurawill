import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import LearningCTA from '@/components/LearningCTA';
import { getMdxBySlug, getMdxSlugs } from '@/lib/mdx';

type PageProps = {
  params: {
    slug: string;
  };
};

/**
 * Pre-build all MDX article pages at build time
 */
export function generateStaticParams() {
  return getMdxSlugs().map((slug) => ({ slug }));
}

/**
 * Per-article SEO metadata
 */
export async function generateMetadata({ params }: PageProps) {
  const mdx = await getMdxBySlug(params.slug);

  if (!mdx) {
    return {};
  }

  return {
    title: `${mdx.metadata.title} | Estate Planning Learning Center`,
    description: mdx.metadata.description,
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const mdx = await getMdxBySlug(params.slug);

  if (!mdx) {
    notFound();
  }

  const { Content, metadata } = mdx;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-4">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/learn"
            className="flex items-center font-semibold text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Learning Center
          </Link>
        </div>
      </header>

      {/* Article */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {metadata.title}
          </h1>

          {metadata.lastUpdated && (
            <p className="text-sm text-gray-500 mb-8">
              Last updated: {metadata.lastUpdated}
            </p>
          )}

          <div className="prose prose-gray max-w-none">
            <Content />
          </div>

          {/* Compliant CTA */}
          <LearningCTA />

          {/* Disclaimer */}
          <div className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-600">
            <p>
              This content is provided for general educational purposes only and
              does not constitute legal advice. Estate planning laws vary by
              state. Consult a qualified attorney regarding your specific
              circumstances.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
