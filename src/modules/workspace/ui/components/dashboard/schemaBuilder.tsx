"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, MonitorPlay, Info } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Slider } from "~/components/ui/slider";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { useUpdateEndpoint } from "~/hooks/use-endpoints";
import { resolveSchema } from "~/lib/schema-resolver";
import type { HttpMethod } from "../sidebar/types";
import {
    FAKER_OPTIONS,
    type SchemaField,
    fieldsFromSchema,
    buildSchema,
} from "./schemaBuilder/schema-utils";

interface SchemaBuilderProps {
    endpoint: {
        id: string;
        name: string;
        method: HttpMethod;
        path: string;
        statusCode: number;
        delayMs: number;
        failureRate: number;
        responseSchema: unknown;
        responseCount: number;
    };
    onSuccess?: () => void;
}

function FieldLabel({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <Label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                {children}
            </Label>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <span className="inline-flex cursor-pointer text-muted-foreground/60 hover:text-primary transition-colors">
                            <Info className="h-3 w-3" />
                        </span>
                    }
                />
                <TooltipContent side="top" className="max-w-56 text-xs">
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export function SchemaBuilder({ endpoint, onSuccess }: SchemaBuilderProps) {
    const [resourceName, setResourceName] = useState(endpoint.name);
    const [nameError, setNameError] = useState<string | null>(null);
    const [delayMs, setDelayMs] = useState(endpoint.delayMs);
    const [failureRate, setFailureRate] = useState(endpoint.failureRate);
    const [responseCount, setResponseCount] = useState(endpoint.responseCount);
    const [fields, setFields] = useState<SchemaField[]>([
        { id: crypto.randomUUID(), fieldName: "", dataType: "$faker.string.uuid" },
    ]);

    const updateEndpoint = useUpdateEndpoint();

    useEffect(() => {
        setResourceName(endpoint.name);
        setNameError(null);
        setDelayMs(endpoint.delayMs);
        setFailureRate(endpoint.failureRate);
        setResponseCount(endpoint.responseCount);
        setFields(fieldsFromSchema(endpoint.responseSchema));
    }, [endpoint]);

    const addField = () => {
        setFields([
            ...fields,
            {
                id: crypto.randomUUID(),
                fieldName: "",
                dataType: "$faker.string.uuid",
            },
        ]);
    };

    const removeField = (id: string) => {
        if (fields.length === 1) return;
        setFields(fields.filter((field) => field.id !== id));
    };

    const updateField = (id: string, key: keyof SchemaField, value: string) => {
        const nextFields = fields.map((field) =>
            field.id === id ? { ...field, [key]: value } : field,
        );
        setFields(nextFields);
    };

    const previewData = useMemo(() => {
        const formattedSchema = buildSchema(fields);
        return Array.from({ length: Math.max(responseCount, 1) }, () =>
            resolveSchema(formattedSchema),
        );
    }, [fields, responseCount]);

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
        if (!resourceName.trim()) {
            setNameError("Resource name is required.");
            return;
        }
        setNameError(null);

        const formattedSchema = buildSchema(fields);

        updateEndpoint.mutate(
            {
                id: endpoint.id,
                name: resourceName,
                responseSchema: formattedSchema,
                delayMs: delayMs,
                failureRate: failureRate,
                responseCount: responseCount,
            },
            {
                onSuccess: () => {
                    toast.success("Schema saved");
                    if (onSuccess) onSuccess();
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to save schema");
                },
            },
        );
    };

    return (
        <TooltipProvider delay={150}>
            <Card className="gap-6 border-none py-6 px-4 shadow-none">
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
                            <p className="text-xs font-medium text-destructive">{nameError}</p>
                        )}
                    </div>

                    <Separator />
                    {/* Behavior config */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        <div className="space-y-1.5">
                            <FieldLabel tooltip="Simulated network latency before this endpoint responds.">
                                Delay
                            </FieldLabel>
                            <div className="relative">
                                <Input
                                    id="delay-ms"
                                    type="number"
                                    min={0}
                                    value={delayMs}
                                    onChange={(e) => setDelayMs(Number(e.target.value))}
                                    className="h-10 border-0 bg-muted pr-10 font-mono shadow-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                                    ms
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <FieldLabel tooltip="Probability that a request to this endpoint returns an error response.">
                                Failure rate
                            </FieldLabel>
                            <div className="flex h-10 items-center gap-3 rounded-md bg-muted px-3">
                                <Slider
                                    value={[failureRate]}
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    onValueChange={(value) =>
                                        setFailureRate(Array.isArray(value) ? value[0]! : value)
                                    }
                                    className="flex-1"
                                />
                                <span className="w-7 shrink-0 text-right font-mono text-xs tabular-nums">
                                    {failureRate.toFixed(1)}
                                </span>
                            </div>
                        </div>

                        <div className="col-span-2 space-y-1.5 md:col-span-1">
                            <FieldLabel tooltip="Number of mock items generated per response.">
                                Response count
                            </FieldLabel>
                            <Input
                                id="response-count"
                                type="number"
                                min={1}
                                value={responseCount}
                                onChange={(e) => setResponseCount(Number(e.target.value))}
                                placeholder="10"
                                className="h-10 border-0 bg-muted font-mono shadow-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Schema fields */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <FieldLabel tooltip="Define the fields used to generate mock data.">
                                Fields schema
                            </FieldLabel>
                            <Badge variant="secondary" className="font-mono text-xs font-medium">
                                {fields.length} {fields.length === 1 ? "field" : "fields"}
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            {fields.length > 0 && (
                                <div className="hidden grid-cols-[1fr_1fr_2.5rem] gap-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
                                    <div>Field name</div>
                                    <div>Data type</div>
                                    <div />
                                </div>
                            )}

                            <ScrollArea className="h-[220px] pr-3">
                                <div className="space-y-2">
                                    {fields.map((field) => (
                                        <div
                                            key={field.id}
                                            className="grid grid-cols-[1fr_1fr_2.5rem] items-center gap-2 rounded-lg border border-transparent p-1 transition-colors hover:border-border sm:gap-3"
                                        >
                                            <Input
                                                type="text"
                                                placeholder="e.g. user_id, created_at"
                                                value={field.fieldName}
                                                onChange={(e) =>
                                                    updateField(
                                                        field.id,
                                                        "fieldName",
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-10 border-0 bg-muted font-mono text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
                                            />

                                            <Select
                                                value={field.dataType}
                                                onValueChange={(value) => {
                                                    if (value)
                                                        updateField(field.id, "dataType", value);
                                                }}
                                            >
                                                <SelectTrigger className="h-10 w-full border-0 bg-muted font-mono text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {FAKER_OPTIONS.map((group) => (
                                                        <SelectGroup key={group.label}>
                                                            <SelectLabel>{group.label}</SelectLabel>
                                                            {group.options.map((option) => (
                                                                <SelectItem
                                                                    key={option.value}
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Tooltip>
                                                <TooltipTrigger
                                                    render={
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={fields.length === 1}
                                                            onClick={() => removeField(field.id)}
                                                            className="h-10 w-10 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                                <TooltipContent side="left" className="text-xs">
                                                    {fields.length === 1
                                                        ? "At least one field is required"
                                                        : "Remove field"}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addField}
                                size="sm"
                                className="mt-1 h-9 gap-1.5 border-dashed border-primary text-muted-foreground hover:text-primary hover:color-primary"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <FieldLabel tooltip="Add a new field to the schema.">
                                    Add field
                                </FieldLabel>
                            </Button>
                        </div>
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
                        <ScrollArea className="h-40">
                            <pre className="bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-100">
                                {JSON.stringify(previewData, null, 2)}
                            </pre>
                        </ScrollArea>
                    </div>
                </CardContent>

                <div className="flex justify-center items-end pt-3">
                    <Button
                        onClick={handleSubmit}
                        disabled={updateEndpoint.isPending}
                        className="h-10 gap-2 font-semibold text-primary-foreground"
                    >
                        {updateEndpoint.isPending
                            ? "Saving..."
                            : hasExistingSchema
                              ? "Update schema"
                              : "Generate schema"}
                    </Button>
                </div>
            </Card>
        </TooltipProvider>
    );
}
