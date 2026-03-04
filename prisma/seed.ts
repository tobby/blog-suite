import { PrismaClient, UserRole, PostStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter }) as PrismaClient;

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Users ───────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@profiledrisk.com" },
    update: {},
    create: {
      email: "admin@profiledrisk.com",
      name: "Admin",
      role: UserRole.Admin,
      passwordHash: await bcrypt.hash("admin123", 12),
    },
  });

  const editorUser = await prisma.user.upsert({
    where: { email: "editor@profiledrisk.com" },
    update: {},
    create: {
      email: "editor@profiledrisk.com",
      name: "ContentManager",
      role: UserRole.ContentManager,
      passwordHash: await bcrypt.hash("editor123", 12),
    },
  });

  const analystUser = await prisma.user.upsert({
    where: { email: "analyst@profiledrisk.com" },
    update: {},
    create: {
      email: "analyst@profiledrisk.com",
      name: "Analyst",
      role: UserRole.Analyst,
      passwordHash: await bcrypt.hash("analyst123", 12),
    },
  });

  console.log("✅ Users seeded:", adminUser.name, editorUser.name, analystUser.name);

  // ─── Blog ────────────────────────────────────────────────
  const blog = await prisma.blog.upsert({
    where: { slug: "fraud-intelligence-weekly" },
    update: {},
    create: {
      name: "Fraud Intelligence Weekly",
      slug: "fraud-intelligence-weekly",
      description: "Weekly fraud intelligence briefings for risk and compliance professionals.",
      template: "fraud-intel",
    },
  });

  console.log("✅ Blog seeded:", blog.name);

  // ─── Categories ──────────────────────────────────────────
  const categories = [
    { name: "Fraud Patterns", slug: "fraud-patterns" },
    { name: "Case Studies", slug: "case-studies" },
    { name: "Threat Intel", slug: "threat-intel" },
  ] as const;

  const seededCategories = await Promise.all(
    categories.map((cat) =>
      prisma.category.upsert({
        where: { blogId_slug: { blogId: blog.id, slug: cat.slug } },
        update: {},
        create: {
          blogId: blog.id,
          name: cat.name,
          slug: cat.slug,
        },
      })
    )
  );

  console.log("✅ Categories seeded:", seededCategories.map((c) => c.name).join(", "));

  // ─── Tags ────────────────────────────────────────────────
  const tags = [
    { name: "AML", slug: "aml" },
    { name: "KYC", slug: "kyc" },
    { name: "Synthetic ID", slug: "synthetic-id" },
    { name: "Account Takeover", slug: "account-takeover" },
  ] as const;

  const seededTags = await Promise.all(
    tags.map((tag) =>
      prisma.tag.upsert({
        where: { blogId_slug: { blogId: blog.id, slug: tag.slug } },
        update: {},
        create: {
          blogId: blog.id,
          name: tag.name,
          slug: tag.slug,
        },
      })
    )
  );

  console.log("✅ Tags seeded:", seededTags.map((t) => t.name).join(", "));

  // ─── Author ──────────────────────────────────────────────
  const author = await prisma.author.upsert({
    where: { blogId_userId: { blogId: blog.id, userId: adminUser.id } },
    update: {},
    create: {
      blogId: blog.id,
      userId: adminUser.id,
      name: adminUser.name,
      jobTitle: "Head of Fraud Intelligence",
      bio: "Leading fraud research and threat analysis at ProfiledRisk.",
    },
  });

  console.log("✅ Author seeded:", author.name);

  // ─── Posts ───────────────────────────────────────────────
  const [fraudPatterns, caseStudies, threatIntel] = seededCategories;
  const [amlTag, kycTag, syntheticIdTag, atoTag] = seededTags;

  const post1 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "synthetic-identity-fraud-ring-disrupted" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "Synthetic Identity Fraud Ring Disrupted After $12M in Losses",
      slug: "synthetic-identity-fraud-ring-disrupted",
      body: "<p>A multi-state synthetic identity fraud ring has been dismantled following a coordinated investigation between federal agencies and financial institutions. The ring leveraged fabricated identities combining real SSNs with fictitious personal information to open thousands of credit accounts over a three-year period.</p><p>Investigators traced the operation through anomalous credit-building patterns that matched known synthetic ID typologies. Machine learning models flagged clusters of applications sharing device fingerprints and behavioral biometrics, ultimately leading to the identification of key operators.</p>",
      tldr: "A synthetic identity fraud ring responsible for $12M in losses was disrupted through coordinated investigation. The operation used fabricated identities combining real SSNs with fictitious data to open thousands of credit accounts.",
      status: PostStatus.Published,
      featured: true,
      authorId: author.id,
      categoryId: caseStudies.id,
      publishedAt: new Date("2026-02-24T09:00:00Z"),
    },
  });

  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post1.id, tagId: syntheticIdTag.id } },
    update: {},
    create: { postId: post1.id, tagId: syntheticIdTag.id },
  });

  const post2 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "account-takeover-surge-q1-2026" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "Account Takeover Attacks Surge 340% in Q1 2026: What Risk Teams Need to Know",
      slug: "account-takeover-surge-q1-2026",
      body: "<p>Account takeover (ATO) attacks have surged dramatically in the first quarter of 2026, driven by credential stuffing campaigns exploiting recently leaked datasets. Financial institutions are reporting unprecedented volumes of unauthorized access attempts, with attackers increasingly using residential proxy networks to evade IP-based detection.</p><p>Risk teams should prioritize behavioral analytics and session-level anomaly detection to identify compromised accounts before funds movement occurs.</p>",
      tldr: "ATO attacks rose 340% in Q1 2026 fueled by credential stuffing from new data leaks. Risk teams should deploy behavioral analytics and session anomaly detection as primary defenses.",
      status: PostStatus.Published,
      featured: false,
      authorId: author.id,
      categoryId: threatIntel.id,
      publishedAt: new Date("2026-03-01T14:00:00Z"),
    },
  });

  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post2.id, tagId: atoTag.id } },
    update: {},
    create: { postId: post2.id, tagId: atoTag.id },
  });

  const post3 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "aml-kyc-convergence-fraud-detection" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "The Convergence of AML and KYC: A New Paradigm for Fraud Detection",
      slug: "aml-kyc-convergence-fraud-detection",
      body: "<p>Traditional silos between AML compliance and KYC onboarding are breaking down as institutions recognize the intelligence value of shared data streams. This draft explores emerging patterns where KYC enrichment data — device intelligence, document verification signals, and behavioral biometrics — feeds directly into transaction monitoring models.</p><p>Early adopters report a 60% improvement in suspicious activity detection rates when AML and KYC signals are fused into unified risk scores at the customer level.</p>",
      tldr: "Merging AML and KYC data streams into unified risk scoring is yielding 60% better suspicious activity detection. This piece examines how institutions are breaking down compliance silos for stronger fraud prevention.",
      status: PostStatus.Draft,
      featured: false,
      authorId: author.id,
      categoryId: fraudPatterns.id,
    },
  });

  await Promise.all([
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post3.id, tagId: amlTag.id } },
      update: {},
      create: { postId: post3.id, tagId: amlTag.id },
    }),
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post3.id, tagId: kycTag.id } },
      update: {},
      create: { postId: post3.id, tagId: kycTag.id },
    }),
  ]);

  console.log("✅ Posts seeded:", post1.title, "|", post2.title, "|", post3.title);

  // ─── Global Settings ─────────────────────────────────────
  const globalSettings = await prisma.globalSettings.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      llmTags: { "robots": "index, follow" },
      sitemapConfig: { enabled: true, changefreq: "weekly", priority: 0.8 },
    },
  });

  console.log("✅ Global settings seeded:", globalSettings.id);
  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
