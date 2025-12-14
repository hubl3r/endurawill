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
