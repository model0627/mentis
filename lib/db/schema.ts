import { pgTable, uuid, text, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";

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
    workspace: text("workspace").notNull().default("private"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_documents_user_id").on(table.userId),
    userParentIdx: index("idx_documents_user_parent").on(
      table.userId,
      table.parentDocument
    ),
    workspaceIdx: index("idx_documents_workspace").on(table.workspace),
  })
);

export const documentPermissions = pgTable(
  "document_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: text("role").notNull().default("viewer"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    docUserUnique: uniqueIndex("idx_doc_perms_doc_user").on(
      table.documentId,
      table.userId
    ),
    userIdx: index("idx_doc_perms_user").on(table.userId),
  })
);
