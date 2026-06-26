"use client";

import React, { useState } from "react";
import { Trash2, Plus, Sparkles } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { FieldLabel } from "~/components/ui/field";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { useCreateEndpoint } from "~/hooks/use-endpoints";

const FAKER_OPTIONS = [
  { value: "uuid", label: "ID (UUID)" },
  { value: "fullName", label: "Full Name" },
  { value: "paragraph", label: "Paragraph" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "phoneNumber", label: "Phone Number" },
];

interface SchemaField {
  id: string;
  fieldName: string;
  dataType: string;
}

interface SchemaBuilderProps {
  projectId: string;
  onSuccess?: () => void;
}

export function SchemaBuilder({ projectId, onSuccess }: SchemaBuilderProps) {
  const [resourceName, setResourceName] = useState("");
  const [statusCode, setStatusCode] = useState<number>(200);
  const [delayMs, setDelayMs] = useState<number>(0);
  const [failureRate, setFailureRate] = useState<number>(0);
  const [responseCount, setResponseCount] = useState(1);
  // const [method, setMethod] = useState<
  //   "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  // >("GET");

  const [fields, setFields] = useState<SchemaField[]>([
    { id: crypto.randomUUID(), fieldName: "", dataType: "uuid" },
  ]);

  const createEndpoint = useCreateEndpoint();

  const addField = () => {
    setFields([
      ...fields,
      { id: crypto.randomUUID(), fieldName: "", dataType: "uuid" },
    ]);
  };

  const removeField = (id: string) => {
    if (fields.length === 1) return;
    setFields(fields.filter((field) => field.id !== id));
  };

  const updateField = (id: string, key: keyof SchemaField, value: string) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, [key]: value } : field,
      ),
    );
  };

  const handleSubmit = () => {
    if (!resourceName.trim()) return;

    const formattedSchema: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.fieldName.trim()) {
        formattedSchema[field.fieldName.trim()] = field.dataType;
      }
    });

    const sanitizedPath = resourceName.startsWith("/")
      ? resourceName
      : `/${resourceName}`;

    createEndpoint.mutate(
      {
        name: resourceName,
        projectId: projectId,
        path: sanitizedPath,
        method: "GET",
        responseSchema: formattedSchema,
        statusCode: statusCode,
        delayMs: delayMs,
        failureRate: failureRate,
        responseCount: responseCount,
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      },
    );
  };

  return (
    <div className="max-w-5xl max-h-5xl flex items-center justify-center">
      <Card className="w-full max-w-4xl shadow-none rounded-lg bg-background p-4">
        <CardHeader className="flex justify-between ">
          <h3 className=" text-xs font-bold tracking-wider text-muted-foreground uppercase">
            NEW RESOURCE
          </h3>
        </CardHeader>

        <div>
          <h1 className="text-xl font-bold font-mono">Resource name</h1>
          <FieldLabel className="text-base text-muted-foreground font-mono">
            Enter meaningful resource name, it will be used to generate API
            endpoints.
          </FieldLabel>
          <Input
            placeholder="Example: users, comments, articles..."
            value={resourceName}
            onChange={(e) => setResourceName(e.target.value)}
            className="mt-3 mb-3 h-14 border-0 bg-muted text-lg font-mono shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="space-y-1 mb-6">
          <h2 className="text-xl font-bold font-mono">Schema</h2>
          <p className="text-base text-muted-foreground font-mono">
            Define Resource schema, it will be used to generate mock data.
          </p>
        </div>
        <CardContent className="space-y-4">
          {fields.length > 0 && (
            <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] gap-4 px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <div>Field Name</div>
              <div>Data Type</div>
              <div className="w-9"></div>
            </div>
          )}

          <div className="space-y-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center sm:gap-4 p-3 sm:p-0 rounded-lg border border-zinc-100 sm:border-0 dark:border-zinc-800"
              >
                <div className="w-full">
                  <label className="text-xs font-medium text-zinc-400 sm:hidden block mb-1">
                    Field Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., user_id, created_at"
                    value={field.fieldName}
                    onChange={(e) =>
                      updateField(field.id, "fieldName", e.target.value)
                    }
                    className="h-12 border-0 bg-muted font-mono text-lg shadow-none focus-visible:ring-0"
                  />
                </div>

                <div className="w-full">
                  <label className="text-xs font-medium text-zinc-400 sm:hidden block mb-1">
                    Data Type
                  </label>
                  <Select
                    value={field.dataType}
                    onValueChange={(value) => {
                      if (value) updateField(field.id, "dataType", value);
                    }}
                  >
                    <SelectTrigger className="h-12 border-0 bg-muted font-mono text-lg shadow-none">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FAKER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
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
                    className="text-muted-foreground hover:bg-muted hover:text-destructive h-12 w-12 disabled:opacity-30"
                    title="Remove field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <Button
            variant="outline"
            onClick={addField}
            className="flex items-center justify-center gap-2 h-10 order-2 sm:order-1"
          >
            <Plus className="h-4 w-4" />
            Add Field
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={createEndpoint.isPending}
            className="flex items-center justify-center gap-2 h-10 order-1 sm:order-2 text-white"
          >
            <Sparkles className="h-4 w-4" />
            {createEndpoint.isPending ? "Generating..." : "Generate Schema"}
          </Button>
        </CardFooter>
        <div>
          <h3 className="text-xl font-bold font-mono w-full ">
            Configurations
          </h3>
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-6 mt-6 font-mono md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="status-code" className="font-bold">
                Status Code
              </Label>
              <Input
                id="status-code"
                type="number"
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
                className="bg-muted border-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delay-ms" className="font-bold">
                Delay (ms)
              </Label>
              <Input
                id="delay-ms"
                type="number"
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
                className="bg-muted border-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="failure-rate" className="font-bold">
                Failure Rate (%)
              </Label>
              <Input
                id="failure-rate"
                type="number"
                min={0}
                max={100}
                value={failureRate}
                onChange={(e) => setFailureRate(Number(e.target.value))}
                className="bg-muted border-0 shadow-none focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="response-count" className="font-bold">
                Response Count
              </Label>
              <Input
                id="response-count"
                type="number"
                min={1}
                value={responseCount}
                onChange={(e) => setResponseCount(Number(e.target.value))}
                placeholder="e.g. 10"
                className="bg-muted border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
