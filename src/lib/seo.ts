interface ArticleData {
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
  author: { name: string; jobTitle?: string | null };
}

export function generateArticleJsonLd(post: ArticleData, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription,
    image: post.ogImage,
    url,
    author: {
      "@type": "Person",
      name: post.author.name,
      ...(post.author.jobTitle && { jobTitle: post.author.jobTitle }),
    },
    publisher: {
      "@type": "Organization",
      name: "BlogSuite",
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
  };
}

export function generateFaqJsonLd(
  faqItems: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
