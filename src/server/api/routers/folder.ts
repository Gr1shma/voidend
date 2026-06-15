import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { folders_table } from "~/server/db/schema";
import { invalidateEndpointData } from "~/lib/endpoint-data-store";

export const folderRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                name: z.string().min(1),
                projectId: z.string().uuid(),
                parentId: z.string().uuid().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [folder] = await ctx.db.insert(folders_table).values(input).returning();
            return folder;
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                name: z.string().min(1).optional(),
                parentId: z.string().uuid().nullable().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            const [updated] = await ctx.db
                .update(folders_table)
                .set(data)
                .where(eq(folders_table.id, id))
                .returning();
            return updated;
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            const folder = await ctx.db.query.folders_table.findFirst({
                where: (f, { eq }) => eq(f.id, input.id),
            });

            if (folder) {
                const allFolders = await ctx.db.query.folders_table.findMany({
                    where: (f, { eq }) => eq(f.projectId, folder.projectId),
                });

                const childMap = new Map<string, string[]>();
                for (const f of allFolders) {
                    if (f.parentId) {
                        const list = childMap.get(f.parentId) ?? [];
                        list.push(f.id);
                        childMap.set(f.parentId, list);
                    }
                }

                const descendantFolderIds: string[] = [folder.id];
                const queue = [folder.id];
                while (queue.length > 0) {
                    const currentId = queue.shift()!;
                    const children = childMap.get(currentId) ?? [];
                    for (const childId of children) {
                        descendantFolderIds.push(childId);
                        queue.push(childId);
                    }
                }

                const endpoints = await ctx.db.query.endpoints_table.findMany({
                    where: (e, { inArray }) => inArray(e.folderId, descendantFolderIds),
                });

                for (const endpoint of endpoints) {
                    invalidateEndpointData(endpoint.projectId, endpoint.id);
                }
            }

            await ctx.db.delete(folders_table).where(eq(folders_table.id, input.id));
        }),

    getByProject: publicProcedure
        .input(z.object({ projectId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.query.folders_table.findMany({
                where: (f, { eq }) => eq(f.projectId, input.projectId),
                orderBy: (f, { asc }) => [asc(f.name)],
            });
        }),
});
