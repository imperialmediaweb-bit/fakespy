-- Add the user foreign keys that were missing from blog posts, audience
-- profiles and ad variations. Orphans (rows referencing a user that no longer
-- exists) are cleaned up first so the constraints can be applied safely.

-- Blog posts: author becomes nullable so published content survives author deletion.
UPDATE "blog_posts" SET "authorId" = NULL WHERE "authorId" IS NOT NULL AND "authorId" NOT IN (SELECT "id" FROM "users");
ALTER TABLE "blog_posts" ALTER COLUMN "authorId" DROP NOT NULL;
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Audience profiles belong to a user; remove with the user.
DELETE FROM "audience_profiles" WHERE "userId" NOT IN (SELECT "id" FROM "users");
ALTER TABLE "audience_profiles" ADD CONSTRAINT "audience_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ad variations belong to a user; remove with the user.
DELETE FROM "ad_variations" WHERE "userId" NOT IN (SELECT "id" FROM "users");
ALTER TABLE "ad_variations" ADD CONSTRAINT "ad_variations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
