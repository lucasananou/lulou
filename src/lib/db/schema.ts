import { pgTable, uuid, text, timestamp, pgEnum, uniqueIndex, boolean, index, jsonb, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const workspaceMemberRoleEnum = pgEnum("workspace_member_role", [
  "owner",
  "admin",
  "member",
]);

export const clientStatusEnum = pgEnum("client_status", [
  "active",
  "paused",
  "archived",
]);

export const socialPlatformEnum = pgEnum("social_platform", [
  "instagram",
  "facebook",
  "linkedin",
  "tiktok",
  "youtube",
  "other",
]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "to_approve",
  "approved",
  "scheduled",
  "published",
  "cancelled",
]);

export const postAssetTypeEnum = pgEnum("post_asset_type", [
  "image",
  "video",
  "external_link",
]);

export const approvalRequestStatusEnum = pgEnum("approval_request_status", [
  "draft",
  "sent",
  "partially_approved",
  "approved",
  "closed",
]);

export const approvalItemStatusEnum = pgEnum("approval_item_status", [
  "pending",
  "approved",
  "rejected",
]);

// Tables
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .references(() => workspaces.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").notNull(), // Clerk user ID
  role: workspaceMemberRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    industry: text("industry"),
    contactName: text("contact_name"),
    contactEmail: text("contact_email"),
    status: clientStatusEnum("status").notNull().default("active"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    workspaceSlugUnique: uniqueIndex("clients_workspace_slug_unique").on(
      table.workspaceId,
      table.slug
    ),
  })
);

// Relations
export const workspacesRelations = relations(workspaces, ({ many }) => ({
  members: many(workspaceMembers),
  clients: many(clients),
}));

export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
  })
);

export const socialAccounts = pgTable(
  "social_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull(),
    platform: socialPlatformEnum("platform").notNull(),
    handle: text("handle").notNull(),
    url: text("url"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    clientPlatformIndex: index("social_accounts_client_platform_idx").on(
      table.clientId,
      table.platform
    ),
    isActiveIndex: index("social_accounts_is_active_idx").on(table.isActive),
  })
);

export const brandProfiles = pgTable(
  "brand_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    toneOfVoice: text("tone_of_voice"),
    brandColors: jsonb("brand_colors").$type<string[]>(),
    audience: text("audience"),
    do: text("do"),
    dont: text("dont"),
    examples: text("examples"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  }
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [clients.workspaceId],
    references: [workspaces.id],
  }),
  socialAccounts: many(socialAccounts),
  brandProfile: one(brandProfiles, {
    fields: [clients.id],
    references: [brandProfiles.clientId],
  }),
}));

export const socialAccountsRelations = relations(socialAccounts, ({ one }) => ({
  client: one(clients, {
    fields: [socialAccounts.clientId],
    references: [clients.id],
  }),
}));

export const brandProfilesRelations = relations(brandProfiles, ({ one }) => ({
  client: one(clients, {
    fields: [brandProfiles.clientId],
    references: [clients.id],
  }),
}));

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull(),
    platform: socialPlatformEnum("platform").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: postStatusEnum("status").notNull().default("draft"),
    tags: jsonb("tags").$type<string[]>(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdBy: text("created_by").notNull(), // Clerk user ID
    approvalRequestId: uuid("approval_request_id")
      .references(() => approvalRequests.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    clientIdIndex: index("posts_client_id_idx").on(table.clientId),
    scheduledAtIndex: index("posts_scheduled_at_idx").on(table.scheduledAt),
    clientScheduledIndex: index("posts_client_scheduled_idx").on(
      table.clientId,
      table.scheduledAt
    ),
  })
);

export const postAssets = pgTable("post_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  type: postAssetTypeEnum("type").notNull(),
  url: text("url").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    metrics: jsonb("metrics").$type<Record<string, string | number>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    clientYearMonthIndex: index("reports_client_year_month_idx").on(
      table.clientId,
      table.year,
      table.month
    ),
    clientYearMonthUnique: uniqueIndex("reports_client_year_month_unique").on(
      table.clientId,
      table.year,
      table.month
    ),
  })
);

export const clientsRelations = relations(clients, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [clients.workspaceId],
    references: [workspaces.id],
  }),
  socialAccounts: many(socialAccounts),
  brandProfile: one(brandProfiles, {
    fields: [clients.id],
    references: [brandProfiles.clientId],
  }),
  posts: many(posts),
  reports: many(reports),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  client: one(clients, {
    fields: [posts.clientId],
    references: [clients.id],
  }),
  assets: many(postAssets),
}));

export const postAssetsRelations = relations(postAssets, ({ one }) => ({
  post: one(posts, {
    fields: [postAssets.postId],
    references: [posts.id],
  }),
}));

export const approvalRequests = pgTable(
  "approval_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull(),
    workspaceId: uuid("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),
    token: text("token").unique(),
    title: text("title").notNull(),
    status: approvalRequestStatusEnum("status").notNull().default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tokenIndex: index("approval_requests_token_idx").on(table.token),
  })
);

export const approvalItems = pgTable("approval_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  approvalRequestId: uuid("approval_request_id")
    .references(() => approvalRequests.id, { onDelete: "cascade" })
    .notNull(),
  postId: uuid("post_id")
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  status: approvalItemStatusEnum("status").notNull().default("pending"),
  clientComment: text("client_comment"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const approvalRequestsRelations = relations(
  approvalRequests,
  ({ one, many }) => ({
    client: one(clients, {
      fields: [approvalRequests.clientId],
      references: [clients.id],
    }),
    workspace: one(workspaces, {
      fields: [approvalRequests.workspaceId],
      references: [workspaces.id],
    }),
    items: many(approvalItems),
  })
);

export const approvalItemsRelations = relations(approvalItems, ({ one }) => ({
  approvalRequest: one(approvalRequests, {
    fields: [approvalItems.approvalRequestId],
    references: [approvalRequests.id],
  }),
  post: one(posts, {
    fields: [approvalItems.postId],
    references: [posts.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  client: one(clients, {
    fields: [posts.clientId],
    references: [clients.id],
  }),
  assets: many(postAssets),
  approvalRequest: one(approvalRequests, {
    fields: [posts.approvalRequestId],
    references: [approvalRequests.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  client: one(clients, {
    fields: [reports.clientId],
    references: [clients.id],
  }),
}));

