"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Code2, RotateCw, LayoutTemplate, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { CodeBlock } from "~/components/code-block";
import { Button } from "~/components/ui/button";
import type { HttpMethod } from "../../sidebar/types";
import { fieldsFromSchema } from "~/lib/faker-options";
import { getTopMatches, generateCode, generateHtmlCode } from "~/lib/component-templates";
import { generateFetchSnippet } from "./generate-fetch-snippet";
import { SchemaPreviewSkeleton } from "./schema-preview-skeleton";

interface SchemaPreviewProps {
    endpoint:
        | {
              method: HttpMethod;
              responseSchema: unknown;
              statusCode: number;
              delayMs: number;
              failureRate: number;
              responseCount: number;
              authConfig?: {
                  isLoginEndpoint?: boolean;
                  requiresAuth?: boolean;
              } | null;
          }
        | null
        | undefined;
    fetchUrl: string;
    bearerToken?: string | null;
    isLoadingSchema?: boolean;
}

export function SchemaPreview({
    endpoint,
    fetchUrl,
    bearerToken,
    isLoadingSchema,
}: SchemaPreviewProps) {
    const [liveData, setLiveData] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [progress, setProgress] = useState(0);
    const animationFrameRef = useRef<number | null>(null);

    const requiresAuth = !!endpoint?.authConfig?.requiresAuth;
    const isLoginEndpoint = !!endpoint?.authConfig?.isLoginEndpoint;

    const copySchema = useCallback(() => {
        if (!endpoint?.responseSchema) return;
        const text = JSON.stringify(endpoint.responseSchema, null, 2);
        void navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, [endpoint?.responseSchema]);

    const fields =
        endpoint?.responseSchema && typeof endpoint.responseSchema === "object"
            ? Object.entries(endpoint.responseSchema as Record<string, string>)
            : [];

    const schemaFields = fieldsFromSchema(endpoint?.responseSchema);
    const topMatches = getTopMatches(schemaFields, fetchUrl);
    const [selectedTemplateId] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<"react" | "html">("react");
    const [fetchTab, setFetchTab] = useState<
        "curl" | "js" | "tsx" | "python" | "go" | "rust" | "php"
    >("curl");

    const activeMatch =
        topMatches.find((m) => m.template.id === selectedTemplateId) ?? topMatches[0];

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
            const headers: HeadersInit = {};
            if (requiresAuth && bearerToken) {
                headers["Authorization"] = `Bearer ${bearerToken}`;
            }

            const res = await fetch(fetchUrl, { method: endpoint.method, headers });
            const json = await res.json().catch(() => null);
            if (res.status === 500 && json) {
                setLiveData(json);
                return;
            }

            if (!res.ok) {
                const serverErrorMessage =
                    json && typeof json === "object" && "error" in json
                        ? String(json.error)
                        : `HTTP error! Status: ${res.status}`;
                throw new Error(serverErrorMessage);
            }

            setLiveData(json);
        } catch (err: any) {
            setError(err.message || "Couldn't fetch a live sample.");
        } finally {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            setProgress(100);
            setIsLoading(false);
        }
    }, [endpoint, fetchUrl, requiresAuth, bearerToken]);

    useEffect(() => {
        void loadSample();

        return () => {
            if (animationFrameRef.current !== null) {
                window.cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [loadSample]);

    if (isLoadingSchema) {
        return <SchemaPreviewSkeleton />;
    }

    if (!endpoint || fields.length === 0) return null;

    return (
        <div className="w-full mx-auto px-6 pb-6 h-full">
            <Card className="border shadow-lg bg-muted">
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-xl font-bold font-mono tracking-tight flex items-center gap-2">
                        <Code2 className="w-5 h-5" />
                        Generated schema
                    </h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={copySchema}
                        className="h-8 gap-2 font-mono text-xs"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? "Copied!" : "Copy schema"}
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                    {requiresAuth && !bearerToken && (
                        <p className="text-xs text-muted-foreground">
                            This endpoint requires authentication. Add a login endpoint to
                            auto-fetch a token for the preview.
                        </p>
                    )}
                    {requiresAuth && !!bearerToken && (
                        <p className="text-xs text-muted-foreground">
                            Protected endpoint, preview is fetched with a valid bearer token from
                            your project&apos;s login endpoint.
                        </p>
                    )}
                    {isLoginEndpoint && (
                        <p className="text-xs text-muted-foreground">
                            Login endpoint, response includes a signed JWT{" "}
                            <code className="font-mono">token</code> field alongside the mock data.
                        </p>
                    )}

                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Field</span>
                            <span>Type</span>
                        </div>
                        {fields.map(([name, type]) => {
                            const displayType =
                                typeof type === "string"
                                    ? type
                                    : typeof type === "object" && type !== null
                                      ? JSON.stringify(type)
                                      : String(type);
                            return (
                                <div
                                    key={name}
                                    className="grid grid-cols-2 px-4 py-2 font-mono text-sm border-t border-zinc-100 dark:border-zinc-800"
                                >
                                    <span className="font-medium">{name}</span>
                                    <span className="text-muted-foreground truncate">
                                        {displayType}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

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

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold font-mono text-muted-foreground">
                                Sample response
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadSample}
                                disabled={isLoading || (requiresAuth && !bearerToken)}
                                className="h-8 gap-2 font-mono text-xs"
                            >
                                <RotateCw
                                    className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
                                />
                                Refresh sample
                            </Button>
                        </div>

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

                    {topMatches.length > 0 && activeMatch && (
                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold font-mono text-muted-foreground flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4" />
                                    {activeTab === "react"
                                        ? "React Component Code"
                                        : "HTML / Vanilla JS Code"}
                                </h3>

                                <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-mono">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("react")}
                                        className={`px-3 py-1 rounded-md font-medium transition-colors ${
                                            activeTab === "react"
                                                ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        React
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("html")}
                                        className={`px-3 py-1 rounded-md font-medium transition-colors ${
                                            activeTab === "html"
                                                ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        HTML
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground font-mono">
                                {activeTab === "react"
                                    ? "Copy-paste React component with custom type interface & auto-fetch logic built from your schema table."
                                    : "Standalone HTML file with inline <style> and <script> tag auto-fetching from your endpoint."}
                            </p>

                            {activeTab === "react" ? (
                                <CodeBlock
                                    code={generateCode(
                                        activeMatch.template,
                                        schemaFields,
                                        fetchUrl,
                                        { requiresAuth, bearerToken, method: endpoint.method },
                                    )}
                                    lang="tsx"
                                    maxHeight="350px"
                                />
                            ) : (
                                <CodeBlock
                                    code={generateHtmlCode(
                                        activeMatch.template,
                                        schemaFields,
                                        fetchUrl,
                                        { requiresAuth, bearerToken, method: endpoint.method },
                                    )}
                                    lang="html"
                                    maxHeight="350px"
                                />
                            )}
                        </div>
                    )}

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold font-mono text-muted-foreground flex items-center gap-2">
                                <Code2 className="w-4 h-4" />
                                API Fetch Snippets
                            </h3>

                            <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-mono overflow-x-auto">
                                {(
                                    [
                                        { id: "curl", label: "cURL" },
                                        { id: "js", label: "JavaScript" },
                                        { id: "tsx", label: "TypeScript" },
                                        { id: "python", label: "Python" },
                                        { id: "go", label: "Go" },
                                        { id: "rust", label: "Rust" },
                                        { id: "php", label: "PHP" },
                                    ] as const
                                ).map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setFetchTab(tab.id)}
                                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                                            fetchTab === tab.id
                                                ? "bg-white dark:bg-zinc-900 text-foreground shadow-xs"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground font-mono">
                            Ready-to-use fetch code snippets tailored for this endpoint and
                            authentication rules.
                        </p>

                        <CodeBlock
                            code={generateFetchSnippet(
                                fetchTab,
                                fetchUrl,
                                endpoint.method,
                                requiresAuth,
                                bearerToken,
                            )}
                            lang={
                                fetchTab === "curl"
                                    ? "bash"
                                    : fetchTab === "js"
                                      ? "javascript"
                                      : fetchTab === "tsx"
                                        ? "typescript"
                                        : fetchTab === "python"
                                          ? "python"
                                          : fetchTab === "go"
                                            ? "go"
                                            : fetchTab === "rust"
                                              ? "rust"
                                              : "php"
                            }
                            maxHeight="350px"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
