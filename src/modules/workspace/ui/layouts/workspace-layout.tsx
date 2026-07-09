"use client";
import { Sidebar } from "../components/sidebar/workspace-sidebar";
import { Button } from "~/components/ui/button";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import { EndpointBar } from "../components/dashboard/endpointBar";
import { SchemaPreview } from "../components/dashboard/schemaPreview";
import { buildMockUrl, getMockOrigin } from "~/lib/mock-path";
import { useEndpointById } from "~/hooks/use-endpoints";
import { useProjectById } from "~/hooks/use-projects";

export function ApiClientLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [mockOrigin, setMockOrigin] = useState(getMockOrigin);

    useEffect(() => {
        setMockOrigin(getMockOrigin());
    }, []);

    const handleSelectEndpoint = (endpointId: string, projectId: string) => {
        setSelectedEndpointId(endpointId);
        setSelectedProjectId(projectId);
    };

    const { data: project } = useProjectById(selectedProjectId);
    const { data: endpoint } = useEndpointById(selectedEndpointId);

    const fetchUrl =
        endpoint && selectedProjectId
            ? buildMockUrl(mockOrigin, selectedProjectId, project?.basePath, endpoint.path)
            : "";

    return (
        <div className="h-full w-full flex border">
            <div
                className={cn(
                    "h-full shrink-0 overflow-hidden border-r transition-all duration-300",
                    isCollapsed ? "w-0 border-r-0" : "w-64",
                )}
            >
                <div className="h-full w-64">
                    <Sidebar
                        selectedEndpointId={selectedEndpointId}
                        onSelectEndpoint={handleSelectEndpoint}
                        selectedProjectId={selectedProjectId}
                        onSelectProject={setSelectedProjectId}
                    />
                </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col bg-background overflow-y-auto">
                <div className="flex items-center gap-2 border-b p-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsCollapsed((v) => !v)}
                        aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
                    >
                        {isCollapsed ? (
                            <PanelLeftOpenIcon className="h-4 w-4" />
                        ) : (
                            <PanelLeftCloseIcon className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {selectedProjectId && (
                    <EndpointBar
                        projectId={selectedProjectId}
                        endpointId={selectedEndpointId}
                        mockOrigin={mockOrigin}
                    />
                )}

                {endpoint && fetchUrl && <SchemaPreview endpoint={endpoint} fetchUrl={fetchUrl} />}
            </div>
        </div>
    );
}
