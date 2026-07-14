"use client";
import { useState } from "react";
import { toast } from "sonner";
import { SchemaBuilder } from "./schemaBuilder";

import { Card, CardContent } from "~/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { Copy, Check, Settings2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MethodBadge } from "~/modules/workspace/ui/components/sidebar/method-badge";
import { buildMockPath } from "~/lib/mock-path";
import { useUpdateEndpoint } from "~/hooks/use-endpoints";

import type { useEndpointById } from "~/hooks/use-endpoints";
import type { useProjectById } from "~/hooks/use-projects";

type Endpoint = NonNullable<ReturnType<typeof useEndpointById>["data"]>;
type Project = NonNullable<ReturnType<typeof useProjectById>["data"]>;

interface EndpointBarProps {
    projectId: string;
    endpointId: string | null;
    mockOrigin: string;
    endpoint: Endpoint | null | undefined;
    project: Project | null | undefined;
}

export const EndpointBar = ({ projectId, mockOrigin, endpoint, project }: EndpointBarProps) => {
    const [isSchemaBuilderOpen, setIsSchemaBuilderOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const updateEndpoint = useUpdateEndpoint();

    const mockPath = endpoint
        ? buildMockPath(project?.basePath, endpoint.path)
        : buildMockPath(project?.basePath, "");

    const mockHost = mockOrigin.replace(/^https?:\/\//, "");
    const mockProtocol = mockOrigin.startsWith("https") ? "https://" : "http://";
    const fullEndpointUrl = endpoint
        ? `${mockProtocol}${mockHost}/mock/${projectId}${mockPath}`
        : `${mockProtocol}${mockHost}/mock/${projectId}${mockPath}`;

    const handleCopy = async () => {
        if (!fullEndpointUrl) return;

        try {
            await navigator.clipboard.writeText(fullEndpointUrl);
            setCopied(true);
            toast.success("Endpoint URL copied");
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error("Failed to copy endpoint URL");
        }
    };

    const handleResetAll = () => {
        if (!endpoint) return;

        setIsResetConfirmOpen(true);
    };

    const confirmResetAll = () => {
        if (!endpoint) return;

        updateEndpoint.mutate(
            {
                id: endpoint.id,
                responseSchema: {},
                responseCount: 1,
                statusCode: 200,
                delayMs: 0,
                failureRate: 0,
            },
            {
                onSuccess: () => {
                    toast.success("Schema reset to defaults");
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to reset schema");
                },
            },
        );
    };

    return (
        <>
            <div className="w-full mx-auto p-6">
                <Card className="border shadow-lg bg-muted">
                    <CardContent className="p-6 space-y-5 ">
                        {/* Heading */}
                        <h2 className="text-xl font-bold font-mono tracking-tight">API endpoint</h2>

                        {/* Endpoint URL Presentation */}
                        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-background/60 p-3 dark:border-zinc-800">
                            <div className="flex flex-wrap items-center justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    {endpoint && <MethodBadge method={endpoint.method} />}
                                    <div className="flex min-w-0 flex-wrap items-center gap-1 font-mono text-sm sm:text-base">
                                        <span className="text-blue-500">{mockProtocol}</span>
                                        <span className="rounded bg-blue-100 px-1.5 py-0.5 font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                                            {mockHost}
                                        </span>
                                        <span className="text-zinc-400">/mock/{projectId}</span>
                                        <span className="rounded bg-orange-100 px-1.5 py-0.5 font-medium text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">
                                            {mockPath}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="h-8 gap-2"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center pt-2">
                            {/* Primary Action */}
                            <Button
                                variant={"default"}
                                onClick={() => setIsSchemaBuilderOpen(true)}
                                disabled={!endpoint}
                                className="pt-2 pb-2"
                            >
                                <Settings2 className="w-4 h-4 stroke-3" />
                                Configure schema
                            </Button>

                            {/* Utility Bulk Actions */}

                            <Button
                                variant="secondary"
                                disabled={!endpoint || updateEndpoint.isPending}
                                onClick={handleResetAll}
                                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 h-10 font-medium rounded-xl text-sm px-4"
                            >
                                {updateEndpoint.isPending ? "Resetting..." : "Reset all"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Dialog open={isSchemaBuilderOpen && !!endpoint} onOpenChange={setIsSchemaBuilderOpen}>
                <DialogContent className="w-full max-w-4xl md:max-w-3xl sm:max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Schema Builder Resource Manager</DialogTitle>

                    <div className="flex-1 overflow-y-auto p-6">
                        {endpoint && (
                            <SchemaBuilder
                                endpoint={endpoint}
                                onSuccess={() => setIsSchemaBuilderOpen(false)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isResetConfirmOpen}
                onOpenChange={setIsResetConfirmOpen}
                title="Reset schema?"
                description="This will restore the endpoint schema and response settings to the default values."
                confirmLabel="Reset"
                cancelLabel="Cancel"
                destructive
                onConfirm={confirmResetAll}
            />
        </>
    );
};
