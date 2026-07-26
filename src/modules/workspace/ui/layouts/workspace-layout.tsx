"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PanelLeftIcon, Plus, Upload, Code2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { Sidebar, type SidebarHandle } from "../components/sidebar/workspace-sidebar";
import { EndpointBar } from "../components/dashboard/endpointBar";
import { SchemaPreview } from "../components/dashboard/schemaPreview";
import { buildMockUrl, getMockOrigin } from "~/lib/mock-path";
import { useEndpointById, useEndpoints, useCreateEndpoint } from "~/hooks/use-endpoints";
import { useProjectById } from "~/hooks/use-projects";
import { ModeToggle } from "~/components/mode-toggle";
import { CreateEndpointDialog } from "../components/sidebar/dialogs";
import { Button } from "~/components/ui/button";
import type { HttpMethod } from "../components/sidebar/types";

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
    const [bearerToken, setBearerToken] = useState<string | null>(null);
    const [createEndpointOpen, setCreateEndpointOpen] = useState(false);
    const createEndpoint = useCreateEndpoint();

    const [sidebarWidth, setSidebarWidth] = useState(256);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        setMockOrigin(getMockOrigin());
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            // Clamp sidebar width between 180px and 480px
            const newWidth = Math.max(180, Math.min(480, e.clientX));
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing]);

    const handleSelectEndpoint = (endpointId: string, projectId: string) => {
        setSelectedEndpointId(endpointId);
        setSelectedProjectId(projectId);
    };

    const { data: project } = useProjectById(selectedProjectId);
    const { data: endpoint, isLoading: isLoadingEndpoint } = useEndpointById(selectedEndpointId);
    const { data: allEndpoints, isLoading: isLoadingAllEndpoints } =
        useEndpoints(selectedProjectId);

    const fetchUrl =
        endpoint && selectedProjectId
            ? buildMockUrl(mockOrigin, selectedProjectId, project?.basePath, endpoint.path)
            : "";

    // Find the login endpoint for this project (if any)
    const loginEndpoint = allEndpoints?.find((e) => e.authConfig?.isLoginEndpoint);

    // Auto-fetch a bearer token from the login endpoint whenever it changes
    const fetchBearerToken = useCallback(async () => {
        if (!loginEndpoint || !selectedProjectId) {
            setBearerToken(null);
            return;
        }
        try {
            const loginUrl = buildMockUrl(
                mockOrigin,
                selectedProjectId,
                project?.basePath,
                loginEndpoint.path,
            );
            const res = await fetch(loginUrl, { method: loginEndpoint.method });
            if (!res.ok) {
                setBearerToken(null);
                return;
            }
            const json = await res.json().catch(() => null);
            const token =
                json && typeof json === "object" && "token" in json ? String(json.token) : null;
            setBearerToken(token);
        } catch {
            setBearerToken(null);
        }
    }, [loginEndpoint, selectedProjectId, mockOrigin, project?.basePath]);

    useEffect(() => {
        void fetchBearerToken();
    }, [fetchBearerToken]);

    const handleCreateEndpoint = (name: string, method: HttpMethod, path: string) => {
        if (!selectedProjectId) return;
        const normalizedPath = path === "/" ? `/${name.toLowerCase().replaceAll(" ", "-")}` : path;
        createEndpoint.mutate(
            {
                name,
                method,
                path: normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`,
                projectId: selectedProjectId,
            },
            {
                onSuccess: (res) => {
                    setCreateEndpointOpen(false);
                    if (res && "id" in res) {
                        setSelectedEndpointId(res.id);
                    }
                },
            },
        );
    };

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* Absolute sidebar */}
            <aside
                className={cn(
                    "absolute inset-y-0 left-0 z-20 flex flex-col bg-background border-r",
                    !isResizing && "transition-all duration-200 ease-in-out",
                    isCollapsed ? "-translate-x-full" : "translate-x-0",
                )}
                style={{ width: sidebarWidth }}
            >
                <div className="flex items-center h-10 px-2 gap-1 border-b shrink-0">
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Open sidebar"
                    >
                        <PanelLeftIcon className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-sm text-center flex-1">voidend</span>
                    <button
                        onClick={() => sidebarRef.current?.openProjectModal()}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="New project"
                        title="New project"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => sidebarRef.current?.openImportModal()}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Import project"
                        title="Import project"
                    >
                        <Upload className="h-4 w-4" />
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

                {/* Resize handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className={cn(
                        "absolute top-0 -right-1 bottom-0 w-2 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-30",
                        isResizing && "bg-primary/40",
                    )}
                />
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
                    "absolute inset-y-0 right-0 flex flex-col overflow-y-auto",
                    !isResizing && "transition-all duration-200",
                )}
                style={{ left: isCollapsed ? 0 : sidebarWidth }}
            >
                <div className="h-10 shrink-0" />
                {selectedProjectId && !isLoadingAllEndpoints && allEndpoints?.length === 0 && (
                    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                        <div className="max-w-md space-y-4">
                            <div className="flex justify-center">
                                <div className="p-4 rounded-full bg-primary/10 text-primary">
                                    <Code2 className="w-10 h-10" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold">No endpoints created yet</h3>
                            <p className="text-sm text-muted-foreground">
                                Create an endpoint to get started. You can specify a path, HTTP
                                method, and design your mock response schema.
                            </p>
                            <Button onClick={() => setCreateEndpointOpen(true)} className="gap-2">
                                <Plus className="w-4 h-4" /> Create Endpoint
                            </Button>
                        </div>
                    </div>
                )}
                {selectedProjectId && allEndpoints && allEndpoints.length > 0 && (
                    <>
                        <EndpointBar
                            projectId={selectedProjectId}
                            endpointId={selectedEndpointId}
                            mockOrigin={mockOrigin}
                            endpoint={endpoint}
                            project={project}
                        />
                        {selectedEndpointId && (
                            <SchemaPreview
                                key={selectedEndpointId}
                                endpoint={endpoint}
                                fetchUrl={fetchUrl}
                                bearerToken={bearerToken}
                                isLoadingSchema={isLoadingEndpoint}
                            />
                        )}
                    </>
                )}
            </div>

            <CreateEndpointDialog
                open={createEndpointOpen}
                onOpenChange={setCreateEndpointOpen}
                onCreate={handleCreateEndpoint}
            />
        </div>
    );
}
