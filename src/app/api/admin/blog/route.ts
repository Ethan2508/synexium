import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// GET — liste tous les articles (admin)
export async function GET() {
  try {
    await requireAdmin();
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}

// POST — créer un article
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { title, excerpt, content, category, categoryColor, coverUrl, published, readTime } = body;

    if (!title || !excerpt || !content || !category) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    let slug = slugify(title);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        category,
        categoryColor: categoryColor || "#283084",
        coverUrl: coverUrl || null,
        published: published ?? false,
        authorId: admin.id,
        readTime: readTime || "5 min",
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "BLOG_CREATED",
        targetType: "BlogPost",
        targetId: post.id,
        details: JSON.stringify({ title: post.title }),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
