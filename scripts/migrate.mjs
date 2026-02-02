import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" text,
    "email" text NOT NULL UNIQUE,
    "password_hash" text,
    "provider" text NOT NULL DEFAULT 'credentials',
    "provider_id" text,
    "image" text,
    "created_at" timestamp DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS "documents" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" text NOT NULL,
    "user_id" text NOT NULL,
    "is_archived" boolean NOT NULL DEFAULT false,
    "is_published" boolean NOT NULL DEFAULT false,
    "parent_document" uuid REFERENCES "documents"("id") ON DELETE SET NULL,
    "content" text,
    "cover_image" text,
    "icon" text,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
  )
`;

await sql`
  ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "workspace" text NOT NULL DEFAULT 'private'
`;

await sql`
  CREATE TABLE IF NOT EXISTS "document_permissions" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "document_id" uuid NOT NULL REFERENCES "documents"("id") ON DELETE CASCADE,
    "user_id" text NOT NULL,
    "role" text NOT NULL DEFAULT 'viewer',
    "created_at" timestamp DEFAULT now()
  )
`;

await sql`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "full_width" boolean NOT NULL DEFAULT false`;
await sql`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "small_text" boolean NOT NULL DEFAULT false`;
await sql`ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "is_locked" boolean NOT NULL DEFAULT false`;

await sql`CREATE INDEX IF NOT EXISTS "idx_documents_user_id" ON "documents"("user_id")`;
await sql`CREATE INDEX IF NOT EXISTS "idx_documents_user_parent" ON "documents"("user_id", "parent_document")`;
await sql`CREATE INDEX IF NOT EXISTS "idx_documents_workspace" ON "documents"("workspace")`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS "idx_doc_perms_doc_user" ON "document_permissions"("document_id", "user_id")`;
await sql`CREATE INDEX IF NOT EXISTS "idx_doc_perms_user" ON "document_permissions"("user_id")`;

// ── Workspace roles & invitations ───────────────────────────
await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" text NOT NULL DEFAULT 'member'`;
await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`;

// Set first registered user as owner (by created_at)
await sql`
  UPDATE "users" SET "role" = 'owner'
  WHERE "id" = (SELECT "id" FROM "users" ORDER BY "created_at" ASC LIMIT 1)
    AND "role" = 'member'
`;

await sql`
  CREATE TABLE IF NOT EXISTS "invitations" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "token" text NOT NULL UNIQUE,
    "invited_by" uuid NOT NULL REFERENCES "users"("id"),
    "email" text,
    "role" text NOT NULL DEFAULT 'member',
    "used_by" uuid REFERENCES "users"("id"),
    "used_at" timestamp,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now()
  )
`;

console.log("Migration complete: users + documents + document_permissions + invitations tables ready");

await sql.end();
