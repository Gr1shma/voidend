import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
};

const createContext = async (req: NextRequest) => {
    return createTRPCContext({
        headers: req.headers,
    });
};

const handler = async (req: NextRequest) => {
    if (req.method === "OPTIONS") {
        return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: () => createContext(req),
        onError:
            env.NODE_ENV === "development"
                ? ({ path, error }) => {
                      console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
                  }
                : undefined,
    });

    const nextResponse = new NextResponse(response.body, response);
    Object.entries(corsHeaders).forEach(([key, value]) => {
        nextResponse.headers.set(key, value);
    });

    return nextResponse;
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
export const OPTIONS = async () => new NextResponse(null, { status: 204, headers: corsHeaders });
