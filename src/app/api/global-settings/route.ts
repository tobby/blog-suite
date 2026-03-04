import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const GLOBAL_ID = "global";

export async function GET() {
  try {
    const settings = await prisma.globalSettings.upsert({
      where: { id: GLOBAL_ID },
      update: {},
      create: {
        id: GLOBAL_ID,
        llmTags: [],
        sitemapConfig: {
          autoGenerate: true,
          changeFrequency: "weekly",
          defaultPriority: 0.7,
        },
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch global settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { llmTags, sitemapConfig, ogDefaultImage, faqSchema } = body;

    const settings = await prisma.globalSettings.upsert({
      where: { id: GLOBAL_ID },
      update: {
        ...(llmTags !== undefined && { llmTags }),
        ...(sitemapConfig !== undefined && { sitemapConfig }),
        ...(ogDefaultImage !== undefined && { ogDefaultImage }),
        ...(faqSchema !== undefined && { faqSchema }),
      },
      create: {
        id: GLOBAL_ID,
        llmTags: llmTags ?? [],
        sitemapConfig: sitemapConfig ?? {
          autoGenerate: true,
          changeFrequency: "weekly",
          defaultPriority: 0.7,
        },
        ogDefaultImage: ogDefaultImage ?? null,
        faqSchema: faqSchema ?? null,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update global settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
