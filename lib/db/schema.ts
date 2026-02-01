import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  provider: text("provider").notNull().default("credentials"),
  providerId: text("provider_id"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    userId: text("user_id").notNull(),
    isArchived: boolean("is_archived").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(false),
    parentDocument: uuid("parent_document").references((): any => documents.id, {
      onDelete: "set null",
    }),
    content: text("content"),
    coverImage: text("cover_image"),
    icon: text("icon"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_documents_user_id").on(table.userId),
    userParentIdx: index("idx_documents_user_parent").on(
      table.userId,
      table.parentDocument
    ),
  })
);
