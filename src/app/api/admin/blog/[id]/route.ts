import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// PATCH — modifier un article
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { title, excerpt, content, category, categoryColor, coverUrl, published, readTime } = body;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(categoryColor !== undefined && { categoryColor }),
        ...(coverUrl !== undefined && { coverUrl }),
        ...(published !== undefined && { published }),
        ...(readTime !== undefined && { readTime }),
      },
    });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "BLOG_UPDATED",
        targetType: "BlogPost",
        targetId: post.id,
        details: JSON.stringify({ title: post.title }),
      },
    });

    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}

// DELETE — supprimer un article
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const post = await prisma.blogPost.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: "BLOG_DELETED",
        targetType: "BlogPost",
        targetId: id,
        details: JSON.stringify({ title: post.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
