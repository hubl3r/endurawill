import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

// Temporary in-memory article source.
// This should later be replaced with MDX or a CMS-backed data source.
const articles: Record<
  string,
  {
    title: string;
    description: string;
    lastUpdated: string;
    content: Array<{ heading?: string; body: string }>;
  }
> = {
  'what-is-a-last-will-and-testament': {
    title: 'What Is a Last Will and Testament?',
    description:
      'An overview of what a last will and testament is, what it does, and why it is a foundational estate planning document.',
    lastUpdated: 'January 2025',
    content: [
      {
        body:
          'A last will and testament is a legal document that outlines how a person’s assets should be distributed after their death. It also allows you to name an executor, appoint guardians for minor children, and provide other final instructions.',
      },
      {
        heading: 'What a Will Can Do',
        body:
          'A will can specify who receives your property, designate guardians for minor children, and name an executor to manage your estate. Without a will, these decisions are typically made according to state law.',
      },
      {
        heading: 'What a Will Cannot Do',
        body:
          'Certain assets, such as retirement accounts or life insurance policies with named beneficiaries, generally pass outside of a will. A will also does not avoid probate.',
      },
    ],
  },
};

export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];

  if (!article) return {};

  return {
    title: `${article.title} | Estate Planning Learning Center`,
    description: article.description,
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];

  if (!article) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-4">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/learn"
            className="text-blue-600 hover:text-blue-800 flex items-center font-semibold"
          >
            <ChevronLeft className="h-5 w-5 mr-1" /> Back to Learning Center
          </Link>
        </div>
      </header>

      {/* Article */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <p className="text-gray-500 text-sm mb-8">
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
            This article is provided for general educational purposes only and
            does not constitute legal advice. Estate planning laws vary by state
            and individual circumstances. Consult a qualified attorney for
            advice specific to your situation.
          </p>
        </div>
      </main>
    </div>
  );
}
