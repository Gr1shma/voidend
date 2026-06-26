"use client";

import { cn } from "~/lib/utils";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Endpoint {
    id: string;
    name: string;
    method: HttpMethod;
    folderId?: string | null;
}

export interface Collection {
    id: string;
    name: string;
    children?: Collection[];
    endpoints?: Endpoint[];
}

const METHOD_STYLES: Record<HttpMethod, string> = {
    GET: "text-emerald-500",
    POST: "text-amber-500",
    PUT: "text-blue-500",
    PATCH: "text-violet-500",
    DELETE: "text-rose-500",
};

export function MethodBadge({ method }: { method: HttpMethod }) {
    return (
        <span
            className={cn(
                "w-11.5 shrink-0 text-[10px] font-bold leading-none tabular-nums",
                METHOD_STYLES[method],
            )}
        >
            {method}
        </span>
    );
}
