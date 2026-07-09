import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { endpoints_table, projects_table } from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { getData, generateAndSaveData } from "~/lib/endpoint-data-store";
import { matchPath, stripBasePath } from "~/lib/mock-path";

interface Params {
    projectId: string;
    path: string[];
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type HttpMethod = (typeof METHODS)[number];

function isValidMethod(m: string): m is HttpMethod {
    return METHODS.includes(m as HttpMethod);
}

async function handler(req: NextRequest, { params }: { params: Params }) {
    const { projectId, path } = params;
    const incomingPath = "/" + path.join("/");
    const method = req.method;

    if (!isValidMethod(method)) {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const project = await db.query.projects_table.findFirst({
        where: eq(projects_table.id, projectId),
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const strippedPath = stripBasePath(incomingPath, project.basePath);

    const candidates = await db.query.endpoints_table.findMany({
        where: and(eq(endpoints_table.projectId, projectId), eq(endpoints_table.method, method)),
    });

    const endpoint = candidates.find((e) => matchPath(e.path, strippedPath));

    if (!endpoint) {
        return NextResponse.json({ error: "No matching endpoint found" }, { status: 404 });
    }

    if (endpoint.delayMs > 0) {
        await new Promise((r) => setTimeout(r, endpoint.delayMs));
    }

    if (endpoint.failureRate > 0 && Math.random() < endpoint.failureRate) {
        return NextResponse.json(endpoint.errorSchema ?? { error: "Simulated failure" }, {
            status: 500,
        });
    }

    const data =
        getData(projectId, endpoint.id) ??
        generateAndSaveData(
            projectId,
            endpoint.id,
            endpoint.responseSchema,
            endpoint.responseCount ?? 1,
        );

    return NextResponse.json(data, {
        status: endpoint.statusCode,
        headers: (endpoint.responseHeaders as Record<string, string>) ?? {},
    });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
