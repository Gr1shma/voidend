import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import z from "zod";
import { projects_table } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { deleteProjectData } from "~/lib/endpoint-data-store";

export const projectRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                title: z.string().min(1),
                description: z.string().optional(),
                basePath: z.string().default("/"),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [project] = await ctx.db.insert(projects_table).values(input).returning();
            return project;
        }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.query.projects_table.findMany({
            orderBy: (p, { desc }) => [desc(p.createdAt)],
        });
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            const project = await ctx.db.query.projects_table.findFirst({
                where: (p, { eq }) => eq(p.id, input.id),
            });

            return project ?? null;
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                title: z.string().min(1).optional(),
                description: z.string().optional(),
                basePath: z.string().optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            const [updated] = await ctx.db
                .update(projects_table)
                .set(data)
                .where(eq(projects_table.id, id))
                .returning();
            return updated;
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
            deleteProjectData(input.id);
            await ctx.db.delete(projects_table).where(eq(projects_table.id, input.id));
        }),
});
