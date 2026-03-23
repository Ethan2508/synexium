import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) return { title: "Article non trouvé" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.published) notFound();

  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      published: true,
      id: { not: post.id },
      category: post.category,
    },
    take: 2,
    orderBy: { createdAt: "desc" },
  });

  return (
    <article className="bg-white min-h-screen">
      {/* Hero */}
      <div
        className="relative py-16 lg:py-24"
        style={{ backgroundColor: `${post.categoryColor}08` }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Retour au blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: post.categoryColor }}
            >
              {post.category}
            </span>
            <span className="text-sm text-text-secondary">
              {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="text-sm text-text-secondary">· {post.readTime} de lecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
            {post.title}
          </h1>
          <p className="mt-6 text-lg text-text-secondary leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Cover image */}
      {post.coverUrl && (
        <div className="max-w-4xl mx-auto px-6 -mt-4 mb-10">
          <img
            src={post.coverUrl}
            alt={post.title}
            className="w-full rounded-2xl shadow-lg object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div
          className="prose prose-lg max-w-none
            prose-headings:text-text-primary prose-headings:font-bold
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text-primary
            prose-ul:text-text-secondary prose-ol:text-text-secondary
            prose-blockquote:border-primary prose-blockquote:text-text-secondary
            prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <div className="bg-surface py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-text-primary mb-8">
              Articles similaires
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group bg-white rounded-xl border border-border hover:shadow-md transition-all p-6"
                >
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: related.categoryColor }}
                  >
                    {related.category}
                  </span>
                  <h3 className="mt-3 font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Professionnel ? Accédez à nos produits
          </h2>
          <p className="text-white/70 mb-6">
            Créez votre compte pour accéder aux prix et commander en ligne.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex px-8 py-3 font-bold bg-solar-green text-white rounded-xl hover:bg-solar-green/90 transition-all"
          >
            Demander un accès
          </Link>
        </div>
      </div>
    </article>
  );
}
