import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import z from "zod";
import { endpoints_table } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { generateAndSaveData, invalidateEndpointData } from "~/lib/endpoint-data-store";

const HttpMethod = z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]);

const responseSchemaShape = z.record(z.string(), z.unknown());

const CACHE_BUSTING_FIELDS = ["responseSchema", "responseCount"] as const;

export const endpointRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                name: z.string().min(1),
                projectId: z.string().uuid(),
                folderId: z.string().uuid().optional(),
                method: HttpMethod.default("GET"),
                path: z.string().min(1),
                statusCode: z.number().int().min(100).max(599).default(200),
                delayMs: z.number().int().min(0).default(0),
                failureRate: z.number().min(0).max(1).default(0),
                responseHeaders: z.record(z.string(), z.string()).optional(),
                responseSchema: responseSchemaShape.default({}),
                responseCount: z.number().int().min(1).max(100).default(1),
                errorSchema: responseSchemaShape.optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [endpoint] = await ctx.db.insert(endpoints_table).values(input).returning();

            generateAndSaveData(
                endpoint!.projectId,
                endpoint!.id,
                endpoint!.responseSchema,
                endpoint!.responseCount ?? 1,
            );

            return endpoint;
        }),

    getByProject: publicProcedure
        .input(z.object({ projectId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.query.endpoints_table.findMany({
                where: (e, { eq }) => eq(e.projectId, input.projectId),
                orderBy: (e, { asc }) => [asc(e.path), asc(e.method)],
            });
        }),

    getByFolder: publicProcedure
        .input(z.object({ folderId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.query.endpoints_table.findMany({
                where: (e, { eq }) => eq(e.folderId, input.folderId),
                orderBy: (e, { asc }) => [asc(e.path), asc(e.method)],
            });
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.query.endpoints_table.findFirst({
                where: (e, { eq }) => eq(e.id, input.id),
            });
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                name: z.string().min(1).optional(),
                method: HttpMethod.optional(),
                path: z.string().min(1).optional(),
                statusCode: z.number().int().min(100).max(599).optional(),
                delayMs: z.number().int().min(0).optional(),
                failureRate: z.number().min(0).max(1).optional(),
                responseHeaders: z.record(z.string(), z.string()).optional(),
                responseSchema: responseSchemaShape.optional(),
                responseCount: z.number().int().min(1).max(100).optional(),
                errorSchema: responseSchemaShape.optional(),
                folderId: z.string().uuid().nullable().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            const [updated] = await ctx.db
                .update(endpoints_table)
                .set(data)
                .where(eq(endpoints_table.id, id))
                .returning();

            const needsRegeneration = CACHE_BUSTING_FIELDS.some((field) => field in data);

            if (needsRegeneration) {
                invalidateEndpointData(updated!.projectId, updated!.id);
                generateAndSaveData(
                    updated!.projectId,
                    updated!.id,
                    updated!.responseSchema,
                    updated!.responseCount ?? 1,
                );
            }

            return updated;
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const endpoint = await ctx.db.query.endpoints_table.findFirst({
                where: (e, { eq }) => eq(e.id, input.id),
            });

            if (endpoint) {
                invalidateEndpointData(endpoint.projectId, endpoint.id);
            }

            await ctx.db.delete(endpoints_table).where(eq(endpoints_table.id, input.id));
        }),

    resolve: publicProcedure
        .input(
            z.object({
                projectId: z.string().uuid(),
                method: HttpMethod,
                path: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const project = await ctx.db.query.projects_table.findFirst({
                where: (p, { eq }) => eq(p.id, input.projectId),
            });

            if (!project) return null;

            const basePath = project.basePath.replace(/\/$/, "");
            const strippedPath = input.path.startsWith(basePath)
                ? input.path.slice(basePath.length) || "/"
                : input.path;

            return ctx.db.query.endpoints_table.findFirst({
                where: (e, { eq, and }) =>
                    and(
                        eq(e.projectId, input.projectId),
                        eq(e.method, input.method),
                        eq(e.path, strippedPath),
                    ),
            });
        }),
});
