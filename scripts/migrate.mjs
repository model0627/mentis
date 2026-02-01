import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" text,
    "email" text NOT NULL UNIQUE,
    "password_hash" text,
    "provider" text NOT NULL DEFAULT 'credentials',
    "provider_id" text,
    "image" text,
    "created_at" timestamp DEFAULT now()
  );
`);

await client.query(`
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
  );
`);

await client.query(`
  CREATE INDEX IF NOT EXISTS "idx_documents_user_id" ON "documents"("user_id");
`);

await client.query(`
  CREATE INDEX IF NOT EXISTS "idx_documents_user_parent" ON "documents"("user_id", "parent_document");
`);

console.log("Migration complete: users + documents tables ready");

await client.end();
