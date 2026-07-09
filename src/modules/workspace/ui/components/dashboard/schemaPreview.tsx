"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Code2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { resolveResponseData } from "~/lib/schema-resolver";
import type { HttpMethod } from "../sidebar/endpoint-item";

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const fields =
        endpoint?.responseSchema && typeof endpoint.responseSchema === "object"
            ? Object.entries(endpoint.responseSchema as Record<string, string>)
            : [];

    const handleCopy = async () => {
        if (!liveData) return;

        try {
            await navigator.clipboard.writeText(JSON.stringify(liveData, null, 2));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setError("Couldn't copy the sample response.");
        }
    };

    const loadSample = useCallback(async () => {
        if (!endpoint) return;

        setLoading(true);
        setError(null);

        const fallbackData = resolveResponseData(
            endpoint.responseSchema,
            endpoint.responseCount ?? 1,
        );
        setLiveData(fallbackData);

        try {
            const res = await fetch(fetchUrl, { method: endpoint.method });
            if (!res.ok) throw new Error("Request failed");
            const json = await res.json();
            setLiveData(json);
        } catch {
            setError(
                "Couldn't fetch a live sample, so the locally generated preview is shown instead.",
            );
        } finally {
            setLoading(false);
        }
    }, [endpoint, fetchUrl]);

    useEffect(() => {
        if (endpoint) {
            void loadSample();
        }
    }, [endpoint, loadSample]);

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
                            status: {endpoint.statusCode}
                        </span>
                        <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900">
                            delay: {endpoint.delayMs}ms
                        </span>
                        <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900">
                            failure rate: {Math.round(endpoint.failureRate * 100)}%
                        </span>
                        <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900">
                            count: {endpoint.responseCount}
                        </span>
                    </div>

                    {/* Live sample response */}
                    <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <h3 className="text-sm font-bold font-mono text-muted-foreground">
                                Sample response
                            </h3>
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={loadSample}
                                    disabled={loading}
                                    className="gap-2"
                                >
                                    <RefreshCw
                                        className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                                    />
                                    {loading ? "Refreshing..." : "Refresh sample"}
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleCopy}
                                    disabled={!liveData || loading}
                                    className="gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    {copied ? "Copied" : "Copy"}
                                </Button>
                            </div>
                        </div>
                        {error && <p className="text-sm text-destructive font-mono">{error}</p>}
                        <pre className="rounded-lg bg-zinc-950 text-zinc-100 text-xs p-4 overflow-x-auto max-h-80 font-mono">
                            {liveData ? JSON.stringify(liveData, null, 2) : "No data yet"}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
