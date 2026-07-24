"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
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

export function SchemaBuilder({ endpoint, onSuccess }: SchemaBuilderProps) {
  const [resourceName, setResourceName] = useState(endpoint.name);
  const [delayMs, setDelayMs] = useState(endpoint.delayMs);
  const [failureRate, setFailureRate] = useState(endpoint.failureRate);
  const [responseCount, setResponseCount] = useState(endpoint.responseCount);
  const [fields, setFields] = useState<SchemaField[]>([
    { id: crypto.randomUUID(), fieldName: "", dataType: "$faker.string.uuid" },
  ]);

  const updateEndpoint = useUpdateEndpoint();

  useEffect(() => {
    setResourceName(endpoint.name);
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

  const handleSubmit = () => {
    if (!resourceName.trim()) return;

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
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Configure Resource
        </h3>
      </div>

      {/* Resource Name and Configurations Row */}
      <div className="space-y-4">
        <div>
          <Label
            htmlFor="resource-name"
            className="text-sm font-bold font-mono"
          >
            Resource name
          </Label>
          <Input
            id="resource-name"
            placeholder="Example: users, comments, articles..."
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            className="mt-1.5 h-12 border-0 bg-muted text-base font-mono shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 font-mono md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="delay-ms" className="text-xs font-bold">
              Delay (ms)
            </Label>
            <Input
              id="delay-ms"
              type="number"
              value={delayMs}
              onChange={(e) => setDelayMs(Number(e.target.value))}
              className="bg-muted border-0 h-10 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="failure-rate" className="text-xs font-bold">
              Failure Rate (0-1)
            </Label>
            <Input
              id="failure-rate"
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={failureRate}
              onChange={(e) => setFailureRate(Number(e.target.value))}
              className="bg-muted border-0 h-10 shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="response-count" className="text-xs font-bold">
              Response Count
            </Label>
            <Input
              id="response-count"
              type="number"
              min={1}
              value={responseCount}
              onChange={(e) => setResponseCount(Number(e.target.value))}
              placeholder="e.g. 10"
              className="bg-muted border-0 h-10 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Schema fields */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-bold font-mono">Fields Schema</h2>
          <p className="text-xs text-muted-foreground font-mono">
            Define fields to generate mock data.
          </p>
        </div>

        <div className="space-y-3">
          {fields.length > 0 && (
            <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] gap-4 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              <div>Field Name</div>
              <div>Data Type</div>
              <div className="w-10"></div>
            </div>
          )}

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {fields.map((field) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center sm:gap-4 p-2 sm:p-0 rounded-lg border border-zinc-100 sm:border-0 dark:border-zinc-800"
              >
                <div className="w-full">
                  <Input
                    type="text"
                    placeholder="e.g., user_id, created_at"
                    value={field.fieldName}
                    onChange={(e) =>
                      updateField(field.id, "fieldName", e.target.value)
                    }
                    className="h-10 border-0 bg-muted font-mono text-sm shadow-none focus-visible:ring-0"
                  />
                </div>

                <div className="w-full">
                  <Select
                    value={field.dataType}
                    onValueChange={(value) => {
                      if (value) updateField(field.id, "dataType", value);
                    }}
                  >
                    <SelectTrigger className="h-10 border-0 bg-muted font-mono text-sm shadow-none">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FAKER_OPTIONS.map((group) => (
                        <SelectGroup key={group.label}>
                          <SelectLabel>{group.label}</SelectLabel>
                          {group.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end sm:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => removeField(field.id)}
                    className="text-muted-foreground hover:bg-muted hover:text-destructive h-10 w-10 disabled:opacity-30"
                    title="Remove field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={addField}
            size="sm"
            className="flex items-center gap-1.5 h-9 font-mono mt-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Field
          </Button>
        </div>
      </div>

      {/* Live sample data preview */}
      <div className="rounded-lg border border-border bg-muted/40 p-4 font-mono">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Live sample data
        </h3>
        <pre className="max-h-40 overflow-auto rounded bg-zinc-950 p-3 text-[11px] text-zinc-100">
          {JSON.stringify(previewData, null, 2)}
        </pre>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end items-center gap-3 border-t pt-4">
        <Button
          onClick={handleSubmit}
          disabled={updateEndpoint.isPending}
          className="flex items-center gap-2 h-10 text-white font-semibold"
        >
          {updateEndpoint.isPending ? "Saving..." : "Generate Schema"}
        </Button>
      </div>
    </div>
  );
}
