import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DOC_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  FICHE_TECHNIQUE: { label: "Fiche technique", icon: "📋", color: "text-blue-600 bg-blue-50" },
  NOTICE: { label: "Notice", icon: "📖", color: "text-purple-600 bg-purple-50" },
  CERTIFICATION: { label: "Certification", icon: "✓", color: "text-green-600 bg-green-50" },
  GARANTIE: { label: "Garantie", icon: "🛡", color: "text-orange-600 bg-orange-50" },
  AUTRE: { label: "Document", icon: "📄", color: "text-gray-600 bg-gray-50" },
};

interface DocumentsPageProps {
  searchParams: Promise<{ type?: string; search?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const { type, search } = await searchParams;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const documents = await prisma.document.findMany({
    where,
    include: {
      products: {
        include: {
          product: { select: { name: true, slug: true, family: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const typeCounts = await prisma.document.groupBy({
    by: ["type"],
    _count: { _all: true },
  });

  const total = typeCounts.reduce((sum, t) => sum + t._count._all, 0);

  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-2">Documentation technique</h1>
          <p className="text-white/70">
            Accédez à l'ensemble des fiches techniques, notices et certifications
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 lg:flex gap-8">
        {/* Sidebar */}
        <aside className="lg:w-60 shrink-0 mb-8 lg:mb-0">
          <div className="bg-white rounded-xl shadow-sm border border-border p-5 sticky top-24">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
              Type de document
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/documents"
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !type ? "bg-primary text-white" : "text-text-secondary hover:bg-surface"
                  }`}
                >
                  Tous ({total})
                </Link>
              </li>
              {Object.entries(DOC_TYPE_LABELS).map(([key, { label }]) => {
                const count = typeCounts.find((t) => t.type === key)?._count._all || 0;
                if (count === 0) return null;
                return (
                  <li key={key}>
                    <Link
                      href={`/documents?type=${key}`}
                      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        type === key ? "bg-primary text-white" : "text-text-secondary hover:bg-surface"
                      }`}
                    >
                      {label} ({count})
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Recherche */}
            <div className="mt-6 pt-6 border-t border-border">
              <form action="/documents" method="GET">
                <input
                  type="text"
                  name="search"
                  placeholder="Rechercher..."
                  defaultValue={search}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </form>
            </div>
          </div>
        </aside>

        {/* Liste documents */}
        <section className="flex-1">
          {documents.length === 0 ? (
            <div className="text-center py-20 text-text-secondary">
              <div className="text-5xl mb-4">📁</div>
              <p className="text-lg font-medium">Aucun document trouvé</p>
              <p className="text-sm mt-1">Essayez un autre filtre ou terme de recherche.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => {
                const typeConfig = DOC_TYPE_LABELS[doc.type] || DOC_TYPE_LABELS.AUTRE;
                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${typeConfig.color}`}>
                        {typeConfig.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-text-primary">{doc.name}</h3>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${typeConfig.color}`}>
                              {typeConfig.label}
                            </span>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors"
                          >
                            Télécharger PDF
                          </a>
                        </div>

                        {doc.products.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-text-secondary mb-2">Produits associés :</p>
                            <div className="flex flex-wrap gap-2">
                              {doc.products.slice(0, 5).map(({ product }) => (
                                <Link
                                  key={product.slug}
                                  href={`/produits/${product.slug}`}
                                  className="text-xs px-2 py-1 bg-surface rounded hover:bg-primary/10 hover:text-primary transition-colors"
                                >
                                  {product.name}
                                </Link>
                              ))}
                              {doc.products.length > 5 && (
                                <span className="text-xs px-2 py-1 bg-surface rounded text-text-secondary">
                                  +{doc.products.length - 5} autres
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
