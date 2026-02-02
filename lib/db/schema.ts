import { pgTable, uuid, text, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  provider: text("provider").notNull().default("credentials"),
  providerId: text("provider_id"),
  image: text("image"),
  role: text("role").notNull().default("member"),
  isActive: boolean("is_active").notNull().default(true),
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
    fullWidth: boolean("full_width").notNull().default(false),
    smallText: boolean("small_text").notNull().default(false),
    isLocked: boolean("is_locked").notNull().default(false),
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

// ── Chat tables ─────────────────────────────────────────────
export const chatRooms = pgTable(
  "chat_rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(), // "page" | "dm"
    documentId: uuid("document_id").references(() => documents.id, {
      onDelete: "cascade",
    }),
    slug: text("slug").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("idx_chat_rooms_slug").on(table.slug),
    documentIdx: index("idx_chat_rooms_document").on(table.documentId),
  })
);

export const chatRoomMembers = pgTable(
  "chat_room_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => chatRooms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    lastReadAt: timestamp("last_read_at"),
    joinedAt: timestamp("joined_at").defaultNow(),
  },
  (table) => ({
    roomUserUnique: uniqueIndex("idx_chat_members_room_user").on(
      table.roomId,
      table.userId
    ),
    userIdx: index("idx_chat_members_user").on(table.userId),
  })
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => chatRooms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    content: text("content"),
    attachmentUrl: text("attachment_url"),
    attachmentName: text("attachment_name"),
    parentMessageId: uuid("parent_message_id"),
    isEdited: boolean("is_edited").notNull().default(false),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    roomIdx: index("idx_chat_messages_room").on(table.roomId),
    parentIdx: index("idx_chat_messages_parent").on(table.parentMessageId),
    roomCreatedIdx: index("idx_chat_messages_room_created").on(
      table.roomId,
      table.createdAt
    ),
  })
);

export const chatReactions = pgTable(
  "chat_reactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    messageId: uuid("message_id")
      .notNull()
      .references(() => chatMessages.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    emoji: text("emoji").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    msgUserEmojiUnique: uniqueIndex("idx_chat_reactions_unique").on(
      table.messageId,
      table.userId,
      table.emoji
    ),
    messageIdx: index("idx_chat_reactions_message").on(table.messageId),
  })
);

export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => users.id),
  email: text("email"),
  role: text("role").notNull().default("member"),
  usedBy: uuid("used_by").references(() => users.id),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
