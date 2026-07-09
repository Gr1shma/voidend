import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { index, pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `ghostend_${name}`);

export const projects_table = createTable(
    "projects",
    (d) => ({
        id: d.uuid().primaryKey().defaultRandom(),
        title: d.text().notNull(),
        description: d.text(),
        basePath: d.text().notNull().default("/"),
        createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
        updatedAt: d
            .timestamp({ withTimezone: true })
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    }),
    (t) => [index("project_title_idx").on(t.title)],
);

export const folders_table = createTable(
    "folders",
    (d) => ({
        id: d.uuid().primaryKey().defaultRandom(),
        name: d.text().notNull(),
        projectId: d
            .uuid()
            .notNull()
            .references(() => projects_table.id, { onDelete: "cascade" }),
        parentId: d.uuid().references((): AnyPgColumn => folders_table.id, { onDelete: "cascade" }),
        createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
        updatedAt: d
            .timestamp({ withTimezone: true })
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    }),
    (t) => [index("folder_project_idx").on(t.projectId), index("folder_parent_idx").on(t.parentId)],
);

export const endpoints_table = createTable(
    "endpoints",
    (d) => ({
        id: d.uuid().primaryKey().defaultRandom(),
        name: d.text().notNull(),
        projectId: d
            .uuid()
            .notNull()
            .references(() => projects_table.id, { onDelete: "cascade" }),
        folderId: d.uuid().references(() => folders_table.id, { onDelete: "cascade" }),
        method: d
            .text({ enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] })
            .notNull()
            .default("GET"),
        path: d.text().notNull(),
        statusCode: d.integer().notNull().default(200),
        responseHeaders: d.jsonb().default({}),
        delayMs: d.integer().notNull().default(0),
        failureRate: d.real().notNull().default(0),
        responseSchema: d.jsonb().notNull().default({}),
        responseCount: d.integer().notNull().default(1),
        errorSchema: d.jsonb().default(null),
        createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
        updatedAt: d
            .timestamp({ withTimezone: true })
            .defaultNow()
            .notNull()
            .$onUpdate(() => new Date()),
    }),
    (t) => [
        index("endpoint_project_idx").on(t.projectId),
        index("endpoint_folder_idx").on(t.folderId),
        index("endpoint_path_idx").on(t.projectId, t.method, t.path), // for fast routing lookup
    ],
);
