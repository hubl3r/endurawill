import Link from 'next/link';
import { getMdxSlugs } from '@/lib/mdx';
import { BookOpen } from 'lucide-react';

export default function LearnIndex() {
  const slugs = getMdxSlugs();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 py-4">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <BookOpen className="h-8 w-8 mr-2 text-blue-600" />
            Learning Center
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {slugs.length > 0 ? (
          <ul className="space-y-4">
            {slugs.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/learn/${slug}`}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
                >
                  {slug.replace(/-/g, ' ')}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">
            No articles found. Please add MDX files to <code>content/learn</code>.
          </p>
        )}
      </main>
    </div>
  );
}
