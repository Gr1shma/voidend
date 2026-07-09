"use client";
import { useState } from "react";
import { toast } from "sonner";
import { SchemaBuilder } from "./schemaBuilder";

import { Card, CardContent } from "~/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
} from "~/components/ui/dialog";
import { Settings2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { MethodBadge } from "~/modules/workspace/ui/components/sidebar/endpoint-item";
import { buildMockPath } from "~/lib/mock-path";
import { useEndpointById, useUpdateEndpoint } from "~/hooks/use-endpoints";
import { useProjectById } from "~/hooks/use-projects";

interface EndpointBarProps {
    projectId: string;
    endpointId: string | null;
    mockOrigin: string;
}

export const EndpointBar = ({ projectId, endpointId, mockOrigin }: EndpointBarProps) => {
    const [isSchemaBuilderOpen, setIsSchemaBuilderOpen] = useState(false);
    const { data: project } = useProjectById(projectId);
    const { data: endpoint } = useEndpointById(endpointId);
    const updateEndpoint = useUpdateEndpoint();

    const mockPath = endpoint
        ? buildMockPath(project?.basePath, endpoint.path)
        : buildMockPath(project?.basePath, "");

    const mockHost = mockOrigin.replace(/^https?:\/\//, "");
    const mockProtocol = mockOrigin.startsWith("https") ? "https://" : "http://";

    const handleResetAll = () => {
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
                        <div className="flex items-center flex-wrap gap-1 font-mono text-sm sm:text-base select-all">
                            <span className="text-blue-500">{mockProtocol}</span>
                            <span className="bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 px-1 rounded font-medium">
                                {mockHost}
                            </span>
                            <span className="text-zinc-400">/mock/{projectId}</span>
                            <span className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 px-1 rounded font-medium">
                                {mockPath}
                            </span>
                            {endpoint && <MethodBadge method={endpoint.method} />}
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
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Button
                                    variant="secondary"
                                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 h-10 font-medium rounded-xl text-sm px-4"
                                >
                                    Generate all
                                </Button>
                                <Button
                                    variant="secondary"
                                    disabled={!endpoint || updateEndpoint.isPending}
                                    onClick={handleResetAll}
                                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 h-10 font-medium rounded-xl text-sm px-4"
                                >
                                    {updateEndpoint.isPending ? "Resetting..." : "Reset all"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Dialog open={isSchemaBuilderOpen && !!endpoint} onOpenChange={setIsSchemaBuilderOpen}>
                <DialogPortal>
                    <DialogOverlay className="fixed inset-0 z-50 " />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <DialogContent className="w-full max-w-4xl border md:max-w-3xl sm:max-w-xl">
                            <DialogTitle className="sr-only">
                                Schema Builder Resource Manager
                            </DialogTitle>

                            <div className="w-full max-h-[85vh] overflow-y-auto rounded-lg">
                                {endpoint && (
                                    <SchemaBuilder
                                        endpoint={endpoint}
                                        onSuccess={() => setIsSchemaBuilderOpen(false)}
                                    />
                                )}
                            </div>
                        </DialogContent>
                    </div>
                </DialogPortal>
            </Dialog>
        </>
    );
};
