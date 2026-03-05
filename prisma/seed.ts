import { PrismaClient, UserRole, PostStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter }) as PrismaClient;

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Users ───────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@blogsuite.com" },
    update: {},
    create: {
      email: "admin@blogsuite.com",
      name: "Admin",
      role: UserRole.Admin,
      passwordHash: await bcrypt.hash("admin123", 12),
    },
  });

  const editorUser = await prisma.user.upsert({
    where: { email: "editor@blogsuite.com" },
    update: {},
    create: {
      email: "editor@blogsuite.com",
      name: "ContentManager",
      role: UserRole.ContentManager,
      passwordHash: await bcrypt.hash("editor123", 12),
    },
  });

  const analystUser = await prisma.user.upsert({
    where: { email: "analyst@blogsuite.com" },
    update: {},
    create: {
      email: "analyst@blogsuite.com",
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
      template: "bold",
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
      bio: "Leading fraud research and threat analysis at BlogSuite.",
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

  // ─── Additional Posts (4–12) ───────────────────────────
  const post4 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "deepfake-voice-cloning-banking" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "Deepfake Voice Cloning Now Targeting Banking Call Centers",
      slug: "deepfake-voice-cloning-banking",
      body: "<p>Fraudsters are deploying real-time voice cloning technology to bypass voice authentication systems at major banking call centers. Using just 10 seconds of publicly available audio, attackers can generate convincing replicas of account holders' voices that fool both automated systems and human agents.</p><p>Financial institutions need to implement multi-factor verification beyond voiceprint alone and consider liveness detection technologies that can distinguish synthetic speech from genuine human voices.</p>",
      tldr: "Real-time voice cloning is being used to bypass banking call center authentication. Institutions should move beyond voiceprint-only verification to multi-factor approaches with liveness detection.",
      metaDescription: "How deepfake voice cloning is being used to bypass banking call center authentication and what risk teams can do about it.",
      status: PostStatus.Published,
      featured: false,
      authorId: author.id,
      categoryId: threatIntel.id,
      publishedAt: new Date("2026-02-10T10:00:00Z"),
    },
  });
  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post4.id, tagId: atoTag.id } },
    update: {},
    create: { postId: post4.id, tagId: atoTag.id },
  });

  const post5 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "mule-network-detection-graph-analytics" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "Detecting Money Mule Networks with Graph Analytics",
      slug: "mule-network-detection-graph-analytics",
      body: "<p>Graph analytics is emerging as the most effective tool for identifying money mule networks that traditional rule-based systems miss. By mapping transaction flows as directed graphs and applying community detection algorithms, investigators can uncover hidden relationships between seemingly unrelated accounts.</p><p>A recent deployment at a top-10 US bank identified 340% more mule accounts than the previous rule-based system, with a 78% reduction in false positives. The key innovation was combining transaction velocity patterns with device fingerprint sharing across nodes.</p>",
      tldr: "Graph analytics outperforms rule-based systems for money mule detection, finding 340% more mule accounts with 78% fewer false positives by mapping transaction flows and device fingerprint sharing.",
      metaDescription: "How graph analytics is revolutionizing money mule network detection in financial institutions.",
      status: PostStatus.Published,
      featured: false,
      authorId: author.id,
      categoryId: fraudPatterns.id,
      publishedAt: new Date("2026-02-12T11:00:00Z"),
    },
  });
  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post5.id, tagId: amlTag.id } },
    update: {},
    create: { postId: post5.id, tagId: amlTag.id },
  });

  const post6 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "pig-butchering-scam-evolution" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "The Evolution of Pig Butchering Scams: From Romance to Crypto Investment",
      slug: "pig-butchering-scam-evolution",
      body: "<p>Pig butchering scams have evolved from simple romance fraud into sophisticated multi-stage cryptocurrency investment schemes. Victims are cultivated over weeks through social engineering before being directed to fraudulent trading platforms that display fabricated returns.</p><p>Law enforcement reports that losses exceeded $4 billion globally in 2025, with the average victim losing $180,000. The operations are typically run from compounds in Southeast Asia, using forced labor to staff the scam operations.</p>",
      tldr: "Pig butchering scams have evolved into sophisticated crypto investment fraud with $4B+ in global losses in 2025. Understanding the multi-stage social engineering tactics is key to prevention.",
      metaDescription: "How pig butchering scams evolved from romance fraud to sophisticated crypto investment schemes causing billions in losses.",
      status: PostStatus.Published,
      featured: false,
      authorId: author.id,
      categoryId: caseStudies.id,
      publishedAt: new Date("2026-02-15T09:30:00Z"),
    },
  });
  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post6.id, tagId: kycTag.id } },
    update: {},
    create: { postId: post6.id, tagId: kycTag.id },
  });

  const post7 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "real-time-payment-fraud-faster-payments" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "Real-Time Payment Fraud: The Challenge of Faster Payments",
      slug: "real-time-payment-fraud-faster-payments",
      body: "<p>As real-time payment networks expand globally, fraud teams face the challenge of making authorization decisions in under 500 milliseconds. Traditional batch-processing fraud models cannot keep pace with instant settlement, creating a window of opportunity for fraudsters.</p><p>Leading institutions are deploying streaming ML models that score transactions in real-time using features like device trust scores, behavioral biometrics, and recipient risk profiles. The shift from batch to streaming architecture requires fundamental changes in both technology and operational workflows.</p>",
      tldr: "Real-time payments demand sub-500ms fraud decisions that batch systems can't deliver. Streaming ML models with device trust, behavioral biometrics, and recipient profiling are the emerging solution.",
      metaDescription: "How financial institutions are tackling fraud in real-time payment systems with streaming ML models.",
      status: PostStatus.Published,
      featured: false,
      authorId: author.id,
      categoryId: fraudPatterns.id,
      publishedAt: new Date("2026-02-18T14:00:00Z"),
    },
  });
  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post7.id, tagId: amlTag.id } },
    update: {},
    create: { postId: post7.id, tagId: amlTag.id },
  });

  const post8 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "credential-stuffing-defense-playbook" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "The Credential Stuffing Defense Playbook for 2026",
      slug: "credential-stuffing-defense-playbook",
      body: "<p>Credential stuffing remains the top attack vector for account takeover, with attackers leveraging massive credential databases from recent breaches. This playbook outlines the layered defense strategy that leading institutions are deploying in 2026.</p><p>Key defenses include: device fingerprinting to detect automated tools, progressive authentication challenges based on risk scoring, credential exposure monitoring to proactively force password resets, and IP reputation services that go beyond simple blocklists to assess residential proxy usage.</p>",
      tldr: "A comprehensive defense playbook against credential stuffing covering device fingerprinting, progressive auth challenges, credential exposure monitoring, and advanced IP reputation analysis.",
      metaDescription: "The definitive 2026 playbook for defending against credential stuffing attacks in financial services.",
      status: PostStatus.Published,
      featured: false,
      authorId: author.id,
      categoryId: threatIntel.id,
      publishedAt: new Date("2026-02-20T08:00:00Z"),
    },
  });
  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post8.id, tagId: atoTag.id } },
    update: {},
    create: { postId: post8.id, tagId: atoTag.id },
  });

  const post9 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "first-party-fraud-buy-now-pay-later" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "First-Party Fraud Is Exploding in Buy Now Pay Later",
      slug: "first-party-fraud-buy-now-pay-later",
      body: "<p>Buy Now Pay Later (BNPL) providers are experiencing a surge in first-party fraud as consumers intentionally default on installment payments. Unlike traditional credit fraud, first-party fraud is committed by the actual account holder, making it extremely difficult to distinguish from legitimate credit losses.</p><p>BNPL providers are developing new signals that combine purchase behavior, return patterns, and social graph analysis to identify likely first-party fraudsters at the point of underwriting rather than after default.</p>",
      tldr: "First-party fraud is surging in BNPL as consumers intentionally default. Providers are using purchase behavior, return patterns, and social graph analysis to catch fraudsters at underwriting.",
      metaDescription: "How buy now pay later providers are fighting the surge of first-party fraud with advanced analytics.",
      status: PostStatus.Published,
      featured: false,
      authorId: author.id,
      categoryId: caseStudies.id,
      publishedAt: new Date("2026-02-22T12:00:00Z"),
    },
  });
  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post9.id, tagId: kycTag.id } },
    update: {},
    create: { postId: post9.id, tagId: kycTag.id },
  });

  const post10 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "ai-generated-documents-kyc-threat" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "AI-Generated Documents Are Breaking KYC Verification",
      slug: "ai-generated-documents-kyc-threat",
      body: "<p>Generative AI can now produce identity documents — driver's licenses, passports, utility bills — that pass automated verification checks with alarming success rates. Testing by a consortium of fintech companies found that AI-generated documents defeated 68% of standard OCR-based verification systems.</p><p>The industry is responding with document forensics that analyze compression artifacts, font rendering inconsistencies, and microprint patterns that current generative models cannot faithfully reproduce.</p>",
      tldr: "AI-generated identity documents are defeating 68% of standard KYC verification systems. Document forensics analyzing compression artifacts and microprint patterns are the emerging countermeasure.",
      metaDescription: "How AI-generated fake documents are defeating KYC systems and what the industry is doing to fight back.",
      status: PostStatus.Published,
      featured: false,
      authorId: author.id,
      categoryId: threatIntel.id,
      publishedAt: new Date("2026-02-26T10:00:00Z"),
    },
  });
  await Promise.all([
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post10.id, tagId: kycTag.id } },
      update: {},
      create: { postId: post10.id, tagId: kycTag.id },
    }),
    prisma.postTag.upsert({
      where: { postId_tagId: { postId: post10.id, tagId: syntheticIdTag.id } },
      update: {},
      create: { postId: post10.id, tagId: syntheticIdTag.id },
    }),
  ]);

  const post11 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "authorized-push-payment-fraud-liability" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "Authorized Push Payment Fraud: Who Bears the Liability?",
      slug: "authorized-push-payment-fraud-liability",
      body: "<p>Authorized push payment (APP) fraud — where victims are socially engineered into sending money to fraudsters — is driving a global policy debate about liability. The UK's mandatory reimbursement framework, effective since late 2024, is now being studied by regulators worldwide as a potential model.</p><p>Banks are investing heavily in confirmation of payee systems, real-time intervention during high-risk payments, and customer education programs. The challenge is balancing fraud prevention with the customer experience of legitimate payments.</p>",
      tldr: "APP fraud liability is shifting globally toward reimbursement models following the UK framework. Banks are deploying confirmation of payee, real-time intervention, and customer education as defenses.",
      metaDescription: "The global policy debate around authorized push payment fraud liability and how banks are responding.",
      status: PostStatus.Published,
      featured: false,
      authorId: author.id,
      categoryId: fraudPatterns.id,
      publishedAt: new Date("2026-02-28T15:00:00Z"),
    },
  });
  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post11.id, tagId: amlTag.id } },
    update: {},
    create: { postId: post11.id, tagId: amlTag.id },
  });

  const post12 = await prisma.post.upsert({
    where: { blogId_slug: { blogId: blog.id, slug: "insider-threat-detection-financial-services" } },
    update: {},
    create: {
      blogId: blog.id,
      title: "Insider Threat Detection in Financial Services: A Data-Driven Approach",
      slug: "insider-threat-detection-financial-services",
      body: "<p>Insider threats remain one of the most damaging yet underdetected risk vectors in financial services. A single compromised or malicious insider can cause tens of millions in losses before detection. Traditional access controls are necessary but insufficient — organizations need behavioral analytics that can detect subtle anomalies in employee activity patterns.</p><p>Modern insider threat programs combine UEBA (User and Entity Behavior Analytics) with data loss prevention, privileged access monitoring, and HR signal integration. The most effective programs maintain employee privacy while detecting genuine risk through aggregated behavioral scoring rather than individual surveillance.</p>",
      tldr: "Insider threats cause massive losses in financial services. Modern detection combines UEBA, DLP, privileged access monitoring, and HR signals while maintaining employee privacy through aggregated behavioral scoring.",
      metaDescription: "A data-driven approach to detecting insider threats in financial services using behavioral analytics.",
      status: PostStatus.Published,
      featured: false,
      authorId: author.id,
      categoryId: caseStudies.id,
      publishedAt: new Date("2026-03-03T11:00:00Z"),
    },
  });
  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post12.id, tagId: amlTag.id } },
    update: {},
    create: { postId: post12.id, tagId: amlTag.id },
  });

  console.log(`✅ Posts seeded: ${[post1, post2, post3, post4, post5, post6, post7, post8, post9, post10, post11, post12].length} posts`);

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
