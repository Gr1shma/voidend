"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Code2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { CodeBlock } from "~/components/code-block";
import type { HttpMethod } from "../sidebar/types";

interface SchemaPreviewProps {
    endpoint:
        | {
              method: HttpMethod;
              responseSchema: unknown;
              statusCode: number;
              delayMs: number;
              failureRate: number;
              responseCount: number;
          }
        | null
        | undefined;
    fetchUrl: string;
}

const FAKER_LABELS: Record<string, string> = {
    "$faker.string.uuid": "UUID",
    "$faker.person.fullName": "Full Name",
    "$faker.lorem.paragraph": "Paragraph",
    "$faker.date.anytime": "Date",
    "$faker.internet.email": "Email",
    "$faker.phone.number": "Phone Number",
};

export function SchemaPreview({ endpoint, fetchUrl }: SchemaPreviewProps) {
    const [liveData, setLiveData] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const animationFrameRef = useRef<number | null>(null);

    const fields =
        endpoint?.responseSchema && typeof endpoint.responseSchema === "object"
            ? Object.entries(endpoint.responseSchema as Record<string, string>)
            : [];

    const loadSample = useCallback(async () => {
        if (!endpoint) return;

        setError(null);
        setLiveData(null);
        setIsLoading(true);
        setProgress(0);

        const duration = Math.max(endpoint.delayMs, 200);
        const startTime = Date.now();

        const tick = () => {
            const elapsed = Date.now() - startTime;
            const nextProgress = Math.min(95, (elapsed / duration) * 100);
            setProgress(nextProgress);

            if (elapsed < duration) {
                animationFrameRef.current = window.requestAnimationFrame(tick);
            }
        };

        animationFrameRef.current = window.requestAnimationFrame(tick);

        try {
            const res = await fetch(fetchUrl, { method: endpoint.method });
            if (!res.ok) throw new Error("Request failed");
            const json = await res.json();
            setLiveData(json);
        } catch (error: any) {
            setError(error.message || "Couldn't fetch a live sample.");
        } finally {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            setProgress(100);
            setIsLoading(false);
        }
    }, [endpoint, fetchUrl]);

    useEffect(() => {
        void loadSample();

        return () => {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [loadSample]);

    if (!endpoint || fields.length === 0) return null;

    return (
        <div className="w-full mx-auto px-6 pb-6 h-full">
            <Card className="border shadow-lg bg-muted">
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-xl font-bold font-mono tracking-tight flex items-center gap-2">
                        <Code2 className="w-5 h-5" />
                        Generated schema
                    </h2>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Field summary table */}
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Field</span>
                            <span>Type</span>
                        </div>
                        {fields.map(([name, type]) => (
                            <div
                                key={name}
                                className="grid grid-cols-2 px-4 py-2 font-mono text-sm border-t border-zinc-100 dark:border-zinc-800"
                            >
                                <span className="font-medium">{name}</span>
                                <span className="text-muted-foreground">
                                    {FAKER_LABELS[type] ?? type}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Config summary */}
                    <div className="flex flex-wrap gap-3 text-xs font-mono">
                        <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900">
                            delay: {endpoint.delayMs}ms
                        </span>
                        <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900">
                            failure rate: {endpoint.failureRate}
                        </span>
                        <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900">
                            count: {endpoint.responseCount}
                        </span>
                    </div>

                    {/* Live sample response */}
                    <div>
                        <h3 className="mb-3 text-sm font-bold font-mono text-muted-foreground">
                            Sample response
                        </h3>
                        {error && (
                            <p className="mb-3 text-sm text-destructive font-mono">{error}</p>
                        )}

                        {isLoading ? (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                                    <span>Generating response...</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                    <div
                                        className="h-full rounded-full bg-primary transition-[width] duration-100 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        ) : null}
                        {!error && liveData ? (
                            <CodeBlock
                                code={JSON.stringify(liveData, null, 2)}
                                lang="json"
                                maxHeight="320px"
                            />
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
