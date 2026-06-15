"use client";
import { useState } from "react";
import { SchemaBuilder } from "./schemaBuilder";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "~/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

export const EndpointBar = () => {
  const [isSchemaBuilderOpen, setIsSchemaBuilderOpen] = useState(false);

  const handleResetAll = () => {
    console.log("Resetting all resources...");
  };

  const handleGenerateAll = () => {
    console.log("Generating all records...");
  };

  return (
    <>
      <div className="w-full  mx-auto p-6">
        <Card className="border shadow-lg">
          <CardContent className="p-6 space-y-5">
            {/* Heading */}
            <h2 className="text-xl font-bold font-mono tracking-tight">
              API endpoint
            </h2>

            {/* Endpoint URL Presentation */}
            <div className="flex items-center flex-wrap gap-1 font-mono text-sm sm:text-base select-all">
              <span className="text-blue-500">https://</span>
              <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 px-1 rounded font-medium">
                localhost:8000
              </span>
              <span className="text-zinc-400">/</span>
              <span className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 px-1 rounded font-medium">
                ghostEnd
              </span>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center pt-2">
              {/* Primary Action */}
              <Button
                variant={"default"}
                onClick={() => setIsSchemaBuilderOpen(true)}
                className="pt-2 pb-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                New resource
              </Button>

              {/* Utility Bulk Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  variant="secondary"
                  onClick={handleGenerateAll}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 h-10 font-medium rounded-xl text-sm px-4"
                >
                  Generate all
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleResetAll}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 h-10 font-medium rounded-xl text-sm px-4"
                >
                  Reset all
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isSchemaBuilderOpen} onOpenChange={setIsSchemaBuilderOpen}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-50 " />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <DialogContent className="w-full max-w-4xl border md:max-w-3xl sm:max-w-xl">
              <DialogTitle className="sr-only">
                Schema Builder Resource Manager
              </DialogTitle>

              <div className="w-full max-h-[85vh] overflow-y-auto rounded-lg">
                <SchemaBuilder />
              </div>
            </DialogContent>
          </div>
        </DialogPortal>
      </Dialog>
    </>
  );
};
