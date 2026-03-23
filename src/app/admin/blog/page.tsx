"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categoryColor: string;
  coverUrl: string | null;
  published: boolean;
  readTime: string;
  createdAt: string;
};

const CATEGORY_PRESETS = [
  { label: "Solaire", color: "#7fb727" },
  { label: "Stockage", color: "#eea400" },
  { label: "Chauffage", color: "#e6332a" },
  { label: "Pompes à chaleur", color: "#e6332a" },
  { label: "Installation", color: "#009fe3" },
  { label: "Réglementation", color: "#283084" },
  { label: "Marché", color: "#283084" },
];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Solaire");
  const [categoryColor, setCategoryColor] = useState("#7fb727");
  const [coverUrl, setCoverUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [readTime, setReadTime] = useState("5 min");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategory("Solaire");
    setCategoryColor("#7fb727");
    setCoverUrl("");
    setPublished(false);
    setReadTime("5 min");
    setEditingPost(null);
    setShowForm(false);
  }

  function openEdit(post: BlogPost) {
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCategory(post.category);
    setCategoryColor(post.categoryColor);
    setCoverUrl(post.coverUrl || "");
    setPublished(post.published);
    setReadTime(post.readTime);
    setEditingPost(post);
    setShowForm(true);
  }

  function openNew() {
    resetForm();
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { title, excerpt, content, category, categoryColor, coverUrl: coverUrl || null, published, readTime };
      const url = editingPost ? `/api/admin/blog/${editingPost.id}` : "/api/admin/blog";
      const method = editingPost ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        fetchPosts();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Supprimer l'article "${post.title}" ?`)) return;
    await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
    fetchPosts();
  }

  async function togglePublished(post: BlogPost) {
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    fetchPosts();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-sm text-primary hover:underline mb-2 inline-block">
              ← Retour au dashboard
            </Link>
            <h1 className="text-3xl font-bold text-text-primary">Gestion du blog</h1>
            <p className="text-text-secondary mt-1">{posts.length} article{posts.length > 1 ? "s" : ""}</p>
          </div>
          <button
            onClick={openNew}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
          >
            + Nouvel article
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-border p-8 mb-8">
            <h2 className="text-xl font-bold text-text-primary mb-6">
              {editingPost ? "Modifier l'article" : "Nouvel article"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">Titre *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Titre de l'article"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">Catégorie *</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setCategory(preset.label);
                          setCategoryColor(preset.color);
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                          category === preset.label
                            ? "text-white scale-105"
                            : "text-text-secondary bg-surface border border-border hover:border-primary/30"
                        }`}
                        style={category === preset.label ? { backgroundColor: preset.color } : {}}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">Résumé *</label>
                <textarea
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  placeholder="Court résumé de l'article (affiché dans les cartes)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1">
                  Contenu * <span className="text-text-secondary font-normal">(HTML supporté)</span>
                </label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono text-sm resize-y"
                  placeholder="<h2>Introduction</h2>
<p>Votre contenu ici...</p>

<h2>Section 1</h2>
<p>...</p>"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">Image de couverture</label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1">Temps de lecture</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="5 min"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm font-semibold text-text-primary">Publier immédiatement</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? "Enregistrement..." : editingPost ? "Mettre à jour" : "Créer l'article"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-text-secondary font-medium hover:text-text-primary transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts list */}
        <div className="space-y-3">
          {posts.length === 0 && !showForm ? (
            <div className="bg-white rounded-2xl border border-border p-12 text-center">
              <svg className="w-12 h-12 mx-auto text-text-secondary/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.625a2.25 2.25 0 01-2.25-2.25V8.625c0-.621.504-1.125 1.125-1.125H7.5" />
              </svg>
              <p className="text-text-secondary mb-4">Aucun article créé</p>
              <button
                onClick={openNew}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors"
              >
                Créer le premier article
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-border p-5 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                <div
                  className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${post.categoryColor}15` }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: post.categoryColor }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-text-primary truncate">{post.title}</h3>
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        post.published
                          ? "bg-solar-green/10 text-solar-green"
                          : "bg-gray-100 text-text-secondary"
                      }`}
                    >
                      {post.published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary truncate">{post.excerpt}</p>
                  <p className="text-xs text-text-secondary/60 mt-0.5">
                    {post.category} · {post.readTime} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {post.published && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 text-text-secondary hover:text-primary transition-colors"
                      title="Voir l'article"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </Link>
                  )}
                  <button
                    onClick={() => togglePublished(post)}
                    className={`p-2 transition-colors ${
                      post.published
                        ? "text-solar-green hover:text-heatpump-red"
                        : "text-text-secondary hover:text-solar-green"
                    }`}
                    title={post.published ? "Dépublier" : "Publier"}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {post.published ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() => openEdit(post)}
                    className="p-2 text-text-secondary hover:text-primary transition-colors"
                    title="Modifier"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    className="p-2 text-text-secondary hover:text-heatpump-red transition-colors"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
