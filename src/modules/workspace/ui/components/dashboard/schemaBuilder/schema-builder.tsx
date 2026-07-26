"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MonitorPlay, SlidersHorizontal, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { TooltipProvider } from "~/components/ui/tooltip";
import { EndpointAuthForm } from "../endpoint-auth-form";
import { useUpdateEndpoint } from "~/hooks/use-endpoints";
import { resolveResponseData } from "~/lib/schema-resolver";
import { buildSchema, fieldsFromSchema } from "~/lib/faker-options";
import type { HttpMethod } from "../../sidebar/types";
import type { SchemaField } from "~/lib/faker-options";
import { BehaviorConfig } from "./behavior-config";
import { SchemaFieldsEditor } from "./schema-fields-editor";
import { RawJsonEditor } from "./raw-json-editor";

interface SchemaBuilderProps {
    endpoint: {
        id: string;
        projectId?: string;
        name: string;
        method: HttpMethod;
        path: string;
        statusCode: number;
        delayMs: number;
        failureRate: number;
        responseSchema: unknown;
        responseCount: number;
    };
    projectId?: string;
    initialTab?: "schema" | "auth";
    onSuccess?: () => void;
}

export function SchemaBuilder({
    endpoint,
    projectId,
    initialTab = "schema",
    onSuccess,
}: SchemaBuilderProps) {
    const [activeTab, setActiveTab] = useState<"schema" | "auth">(initialTab);
    const [resourceName, setResourceName] = useState(endpoint.name);
    const [nameError, setNameError] = useState<string | null>(null);
    const [schemaPath, setSchemaPath] = useState(endpoint.path);
    const [pathError, setPathError] = useState<string | null>(null);
    const [httpMethod, setHttpMethod] = useState<HttpMethod>(endpoint.method);
    const [delayMs, setDelayMs] = useState(endpoint.delayMs);
    const [failureRate, setFailureRate] = useState(endpoint.failureRate);
    const [responseCount, setResponseCount] = useState(endpoint.responseCount);
    const [fields, setFields] = useState<SchemaField[]>([
        { id: crypto.randomUUID(), fieldName: "", dataType: "$faker.string.uuid" },
    ]);
    const [editorMode, setEditorMode] = useState<"flat" | "raw">("flat");
    const [rawSchemaText, setRawSchemaText] = useState<string>("");
    const [jsonError, setJsonError] = useState<string | null>(null);

    const updateEndpoint = useUpdateEndpoint();

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        setResourceName(endpoint.name);
        setNameError(null);
        setSchemaPath(endpoint.path);
        setPathError(null);
        setHttpMethod(endpoint.method);
        setDelayMs(endpoint.delayMs);
        setFailureRate(endpoint.failureRate);
        setResponseCount(endpoint.responseCount);
        setFields(fieldsFromSchema(endpoint.responseSchema));
        setRawSchemaText(
            endpoint.responseSchema
                ? JSON.stringify(endpoint.responseSchema, null, 2)
                : JSON.stringify({ id: "$faker.string.uuid" }, null, 2),
        );
        setJsonError(null);
    }, [endpoint]);

    const addField = () => {
        setFields([
            ...fields,
            { id: crypto.randomUUID(), fieldName: "", dataType: "$faker.string.uuid" },
        ]);
    };

    const removeField = (id: string) => {
        if (fields.length === 1) return;
        setFields(fields.filter((field) => field.id !== id));
    };

    const updateField = (id: string, key: keyof SchemaField, value: string) => {
        setFields(fields.map((field) => (field.id === id ? { ...field, [key]: value } : field)));
    };

    const seed = projectId || endpoint.projectId || endpoint.id;

    const previewData = useMemo(() => {
        let formattedSchema: unknown;
        if (editorMode === "raw") {
            try {
                formattedSchema = JSON.parse(rawSchemaText);
            } catch {
                formattedSchema = buildSchema(fields);
            }
        } else {
            formattedSchema = buildSchema(fields);
        }
        return resolveResponseData(formattedSchema, responseCount, seed);
    }, [fields, editorMode, rawSchemaText, responseCount, seed]);

    const hasExistingSchema = useMemo(() => {
        if (
            !endpoint.responseSchema ||
            typeof endpoint.responseSchema !== "object" ||
            Array.isArray(endpoint.responseSchema)
        ) {
            return false;
        }
        return Object.keys(endpoint.responseSchema).length > 0;
    }, [endpoint.responseSchema]);

    const handleSubmit = () => {
        let hasError = false;

        if (!resourceName.trim()) {
            setNameError("Resource name is required.");
            hasError = true;
        } else {
            setNameError(null);
        }

        const trimmedPath = schemaPath.trim();
        if (!trimmedPath) {
            setPathError("Path is required.");
            hasError = true;
        } else if (!trimmedPath.startsWith("/")) {
            setPathError("Path must start with /");
            hasError = true;
        } else {
            setPathError(null);
        }

        if (hasError) return;

        let formattedSchema: unknown;
        if (editorMode === "raw") {
            try {
                formattedSchema = JSON.parse(rawSchemaText);
            } catch (err: any) {
                setJsonError(err.message || "Invalid JSON syntax");
                return;
            }
        } else {
            formattedSchema = buildSchema(fields);
        }

        updateEndpoint.mutate(
            {
                id: endpoint.id,
                name: resourceName,
                path: trimmedPath,
                method: httpMethod,
                responseSchema: formattedSchema as Record<string, unknown>,
                delayMs,
                failureRate,
                responseCount,
            },
            {
                onSuccess: () => {
                    if (onSuccess) onSuccess();
                },
            },
        );
    };

    return (
        <TooltipProvider delay={150}>
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "schema" | "auth")}
                orientation="horizontal"
                className="w-full flex-1 flex flex-col gap-0"
            >
                <div className="w-full px-6 pt-5 pb-3 border-b bg-muted/30">
                    <TabsList className="grid w-full grid-cols-2 h-10">
                        <TabsTrigger
                            value="schema"
                            className="gap-2 text-xs font-semibold uppercase tracking-wider"
                        >
                            <SlidersHorizontal className="h-4 w-4" /> Schema &amp; Behavior
                        </TabsTrigger>
                        <TabsTrigger
                            value="auth"
                            className="gap-2 text-xs font-semibold uppercase tracking-wider"
                        >
                            <Shield className="h-4 w-4 text-emerald-500" /> Authentication
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="schema" className="flex-1 flex flex-col">
                    <Card className="gap-6 border-none py-6 px-4 shadow-none rounded-none h-full flex flex-col justify-between">
                        <CardHeader className="gap-1 px-0">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Configure resource
                            </CardTitle>
                            <CardDescription className="font-mono text-xs">
                                Define the endpoint&apos;s identity, behavior, and response shape.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6 px-0">
                            {/* Resource name */}
                            <div className="space-y-1.5">
                                <Label htmlFor="resource-name" className="text-sm font-semibold">
                                    Resource name
                                </Label>
                                <Input
                                    id="resource-name"
                                    placeholder="users, comments, articles..."
                                    value={resourceName}
                                    onChange={(e) => {
                                        setResourceName(e.target.value);
                                        if (nameError) setNameError(null);
                                    }}
                                    aria-invalid={!!nameError}
                                    className="h-11 border-0 bg-muted font-mono text-base shadow-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-2 aria-invalid:ring-destructive/50"
                                />
                                {nameError && (
                                    <p className="text-xs font-medium text-destructive">
                                        {nameError}
                                    </p>
                                )}
                            </div>

                            {/* Schema path + HTTP method */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold">Schema path</Label>
                                <div className="flex items-stretch gap-2">
                                    <div className="flex rounded-md bg-muted p-0.5 shrink-0">
                                        {(
                                            [
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "PATCH",
                                                "DELETE",
                                            ] as HttpMethod[]
                                        ).map((m) => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setHttpMethod(m)}
                                                className={`px-2 py-1 rounded-sm text-[11px] font-bold tracking-wide transition-colors ${
                                                    httpMethod === m
                                                        ? m === "GET"
                                                            ? "bg-emerald-500/20 text-emerald-400 shadow-xs"
                                                            : m === "POST"
                                                              ? "bg-blue-500/20 text-blue-400 shadow-xs"
                                                              : m === "PUT"
                                                                ? "bg-amber-500/20 text-amber-400 shadow-xs"
                                                                : m === "PATCH"
                                                                  ? "bg-purple-500/20 text-purple-400 shadow-xs"
                                                                  : "bg-rose-500/20 text-rose-400 shadow-xs"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative flex-1">
                                        <Input
                                            id="schema-path"
                                            placeholder="/users/:id"
                                            value={schemaPath}
                                            onChange={(e) => {
                                                setSchemaPath(e.target.value);
                                                if (pathError) setPathError(null);
                                            }}
                                            aria-invalid={!!pathError}
                                            className="h-11 border-0 bg-muted font-mono text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-2 aria-invalid:ring-destructive/50"
                                        />
                                    </div>
                                </div>
                                {pathError && (
                                    <p className="text-xs font-medium text-destructive">
                                        {pathError}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <BehaviorConfig
                                delayMs={delayMs}
                                onDelayMsChange={setDelayMs}
                                failureRate={failureRate}
                                onFailureRateChange={setFailureRate}
                                responseCount={responseCount}
                                onResponseCountChange={setResponseCount}
                            />

                            <Separator />

                            {/* Schema fields editor */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                                            Fields schema
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex rounded-md bg-muted p-0.5 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (editorMode === "raw") {
                                                        try {
                                                            const parsed =
                                                                JSON.parse(rawSchemaText);
                                                            setFields(fieldsFromSchema(parsed));
                                                            setJsonError(null);
                                                        } catch {
                                                            // Keep current fields if invalid
                                                        }
                                                    }
                                                    setEditorMode("flat");
                                                }}
                                                className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
                                                    editorMode === "flat"
                                                        ? "bg-background text-foreground shadow-xs font-semibold"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                Flat Columns
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (editorMode === "flat") {
                                                        const current = buildSchema(fields);
                                                        setRawSchemaText(
                                                            JSON.stringify(current, null, 2),
                                                        );
                                                    }
                                                    setEditorMode("raw");
                                                }}
                                                className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
                                                    editorMode === "raw"
                                                        ? "bg-background text-foreground shadow-xs font-semibold"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                Nested Raw JSON
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {editorMode === "flat" ? (
                                    <SchemaFieldsEditor
                                        fields={fields}
                                        onAddField={addField}
                                        onRemoveField={removeField}
                                        onUpdateField={updateField}
                                        onSubmit={handleSubmit}
                                        isPending={updateEndpoint.isPending}
                                        hasExistingSchema={hasExistingSchema}
                                    />
                                ) : (
                                    <RawJsonEditor
                                        value={rawSchemaText}
                                        onChange={setRawSchemaText}
                                        error={jsonError}
                                        onErrorChange={setJsonError}
                                        onFieldsSync={setFields}
                                        onSubmit={handleSubmit}
                                        isPending={updateEndpoint.isPending}
                                        hasJsonError={!!jsonError}
                                        hasExistingSchema={hasExistingSchema}
                                    />
                                )}
                            </div>

                            <Separator />

                            {/* Live sample data preview */}
                            <div className="overflow-hidden rounded-lg border border-border">
                                <div className="flex items-center gap-1.5 border-b bg-muted/40 px-3 py-2">
                                    <MonitorPlay className="h-3 w-3 text-primary" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Live preview
                                    </span>
                                </div>
                                <pre className="bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-100 overflow-x-auto">
                                    {JSON.stringify(previewData, null, 2)}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="auth" className="flex-1 flex flex-col">
                    <EndpointAuthForm endpointId={endpoint.id} onSuccess={onSuccess} />
                </TabsContent>
            </Tabs>
        </TooltipProvider>
    );
}
