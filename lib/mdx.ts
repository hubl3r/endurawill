import fs from 'fs';
import path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'content/learn');

export function getMdxSlugs() {
  return fs
    .readdirSync(CONTENT_PATH)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\\.mdx$/, ''));
}

export async function getMdxBySlug(slug: string) {
  const fullPath = path.join(CONTENT_PATH, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const { default: Content, metadata } = await import(
    `@/content/learn/${slug}.mdx`
  );

  return {
    Content,
    metadata,
  };
}
