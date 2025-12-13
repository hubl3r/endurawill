import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { learningArticles } from '@/lib/learningArticles';

export function generateStaticParams() {
  return Object.keys(learningArticles).map((slug) => ({
    slug,
  }));
}

type PageProps = {
  params: {
    slug: string;
  };
};

export function generateMetadata({ params }: PageProps) {
  const article = learningArticles[params.slug];

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} | Estate Planning Learning Center`,
    description: article.description,
  };
}

export default function ArticlePage({ params }: PageProps) {
  const article = learningArticles[params.slug];

  if (!article) {
    notFound();
  }

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
            {article.title}
          </h1>

          <p className="text-sm text-gray-500 mb-8">
            Last updated: {article.lastUpdated}
          </p>

          <div className="prose prose-gray max-w-none">
            {article.content.map((section, index) => (
              <section key={index} className="mb-6">
                {section.heading && (
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    {section.heading}
                  </h2>
                )}
                <p className="text-gray-700">{section.body}</p>
              </section>
            ))}
          </div>
        </article>

        {/* Disclaimer */}
        <div className="mt-12 border-t border-gray-200 pt-6 text-sm text-gray-600">
          <p>
            This content is provided for general educational purposes only and
            does not constitute legal advice. Estate planning laws vary by
            state. Consult a qualified attorney regarding your specific
            circumstances.
          </p>
        </div>
      </main>
    </div>
  );
}
