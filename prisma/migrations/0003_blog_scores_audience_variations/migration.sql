-- Blog
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

CREATE TABLE "blog_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "blog_tags_slug_key" ON "blog_tags"("slug");

CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "categoryId" TEXT,
    "authorId" TEXT NOT NULL,
    "featuredImage" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");
CREATE INDEX "blog_posts_status_idx" ON "blog_posts"("status");
CREATE INDEX "blog_posts_authorId_idx" ON "blog_posts"("authorId");
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "blog_post_tags" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    CONSTRAINT "blog_post_tags_pkey" PRIMARY KEY ("postId", "tagId")
);
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "blog_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ad Scoring
CREATE TABLE "ad_scores" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "clarityScore" INTEGER NOT NULL,
    "emotionalImpact" INTEGER NOT NULL,
    "ctrPotential" INTEGER NOT NULL,
    "conversionStrength" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "suggestions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ad_scores_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ad_scores_generationId_key" ON "ad_scores"("generationId");
ALTER TABLE "ad_scores" ADD CONSTRAINT "ad_scores_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "ad_generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Audience Builder
CREATE TABLE "audience_profiles" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" JSONB NOT NULL,
    "painPoints" JSONB NOT NULL,
    "desires" JSONB NOT NULL,
    "objections" JSONB NOT NULL,
    "buyingTriggers" JSONB NOT NULL,
    "demographics" JSONB NOT NULL,
    "interests" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "audience_profiles_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audience_profiles_projectId_idx" ON "audience_profiles"("projectId");
CREATE INDEX "audience_profiles_userId_idx" ON "audience_profiles"("userId");
ALTER TABLE "audience_profiles" ADD CONSTRAINT "audience_profiles_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ad Variations
CREATE TABLE "ad_variations" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "output" JSONB NOT NULL,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ad_variations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ad_variations_generationId_idx" ON "ad_variations"("generationId");
ALTER TABLE "ad_variations" ADD CONSTRAINT "ad_variations_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "ad_generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
