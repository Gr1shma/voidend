"use client";
import { useEffect, useRef, useState } from "react";
import { PanelLeftIcon, Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import { Sidebar, type SidebarHandle } from "../components/sidebar/workspace-sidebar";
import { EndpointBar } from "../components/dashboard/endpointBar";
import { SchemaPreview } from "../components/dashboard/schemaPreview";
import { buildMockUrl, getMockOrigin } from "~/lib/mock-path";
import { useEndpointById } from "~/hooks/use-endpoints";
import { useProjectById } from "~/hooks/use-projects";
import { ModeToggle } from "~/components/mode-toggle";

export function ApiClientLayout({
    isCollapsed,
    onToggle,
}: {
    isCollapsed: boolean;
    onToggle: () => void;
}) {
    const sidebarRef = useRef<SidebarHandle>(null);
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
        <div className="relative h-full w-full overflow-hidden">
            {/* Absolute sidebar */}
            <aside
                className={cn(
                    "absolute inset-y-0 left-0 z-20 w-64 flex flex-col bg-background border-r",
                    "transition-transform duration-200 ease-in-out",
                    isCollapsed ? "-translate-x-full" : "translate-x-0",
                )}
            >
                <div className="flex items-center h-10 px-2 gap-1 border-b shrink-0">
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Close sidebar"
                    >
                        <PanelLeftIcon className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-sm text-center flex-1">voidend</span>
                    <button
                        onClick={() => sidebarRef.current?.openProjectModal()}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="New project"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 min-h-0">
                    <Sidebar
                        ref={sidebarRef}
                        selectedEndpointId={selectedEndpointId}
                        onSelectEndpoint={handleSelectEndpoint}
                        selectedProjectId={selectedProjectId}
                        onSelectProject={setSelectedProjectId}
                    />
                </div>
            </aside>

            <div className="absolute inset-x-0 top-0 z-30 h-10 flex items-center pointer-events-none">
                <div className="flex items-center h-full px-2 pointer-events-auto">
                    {isCollapsed && (
                        <button
                            onClick={onToggle}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label="Open sidebar"
                        >
                            <PanelLeftIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="ml-auto flex items-center h-full px-2 pointer-events-auto transition-colors duration-200">
                    <ModeToggle />
                </div>
            </div>

            <div
                className={cn(
                    "absolute inset-y-0 right-0 flex flex-col overflow-y-auto transition-all duration-200",
                    isCollapsed ? "left-0" : "left-64",
                )}
            >
                <div className="h-10 shrink-0" />
                {selectedProjectId && (
                    <EndpointBar
                        projectId={selectedProjectId}
                        endpointId={selectedEndpointId}
                        mockOrigin={mockOrigin}
                        endpoint={endpoint}
                        project={project}
                    />
                )}
                {endpoint && fetchUrl && (
                    <SchemaPreview
                        key={selectedEndpointId}
                        endpoint={endpoint}
                        fetchUrl={fetchUrl}
                    />
                )}
            </div>
        </div>
    );
}
