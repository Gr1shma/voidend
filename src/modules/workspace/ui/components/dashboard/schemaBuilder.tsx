"use client";

import React, { useState } from "react";
import { Trash2, Plus, Sparkles, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
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
import { Dialog, DialogContent } from "~/components/ui/dialog";

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

export function SchemaBuilder() {
  const [fields, setFields] = useState<SchemaField[]>([
    { id: crypto.randomUUID(), fieldName: "", dataType: "uuid" },
  ]);

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
    console.log("Generated Schema Structure:", fields);
  };

  return (
    <div className="max-w-5xl max-h-5xl flex items-center justify-center">
      <Card className="w-full max-w-4xl  shadow-none rounded-lg bg-background p-4">
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
          {/* Header Labels for Columns (Hidden on small screens for responsiveness) */}
          {fields.length > 0 && (
            <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] gap-4 px-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <div>Field Name</div>
              <div>Data Type</div>
              <div className="w-9"></div> {/* Match trash button width */}
            </div>
          )}

          <div className="space-y-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center  sm:gap-4 p-3 sm:p-0 rounded-lg border border-zinc-100 sm:border-0 dark:border-zinc-800"
              >
                {/* Field Name Input */}
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

                {/* Data Type Select */}
                <div className="w-full">
                  <label className="text-xs font-medium text-zinc-400 sm:hidden block mb-1">
                    Data Type
                  </label>
                  <Select
                    value={field.dataType}
                    onValueChange={(value) =>
                      updateField(field.id, "dataType", value)
                    }
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

                {/* Remove Action */}
                <div className="flex justify-end sm:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => removeField(field.id)}
                    className=" text-muted-foreground hover:bg-muted hover:text-destructive h-12 w-12 disabled:opacity-30"
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
            variant="secondary"
            className="flex items-center justify-center gap-2 h-10 order-2 sm:order-1"
          >
            Create Schema
          </Button>

          <Button
            onClick={handleSubmit}
            className="flex items-center justify-center gap-2 h-10 order-1 sm:order-2 text-white"
          >
            <Sparkles className="h-4 w-4" />
            Generate Schema
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
