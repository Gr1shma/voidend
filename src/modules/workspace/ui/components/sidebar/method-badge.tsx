"use client";

import { cn } from "~/lib/utils";
import type { HttpMethod } from "./types";

export const METHOD_STYLES: Record<HttpMethod, string> = {
    GET: "text-emerald-500",
    POST: "text-amber-500",
    PUT: "text-blue-500",
    PATCH: "text-violet-500",
    DELETE: "text-rose-500",
};

export function MethodBadge({ method, className }: { method: HttpMethod; className?: string }) {
    return (
        <span
            className={cn(
                "w-10 shrink-0 text-[10px] font-bold leading-none tabular-nums",
                METHOD_STYLES[method],
                className,
            )}
        >
            {method}
        </span>
    );
}
