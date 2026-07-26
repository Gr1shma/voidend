"use client";

import { forwardRef, useImperativeHandle } from "react";
import { Plus, Upload } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { TreeProvider, TreeView } from "~/components/kibo-ui/tree";
import {
    CreateFolderDialog,
    CreateEndpointDialog,
    CreateProjectDialog,
    ImportProjectDialog,
} from "./dialogs";
import { ProjectSettingsDialog } from "./project-settings-dialog";
import { ProjectTreeNode } from "./sidebar-tree";
import { SidebarSkeleton } from "./sidebar-skeleton";
import type { SidebarProject } from "./types";
import { useSidebarActions } from "./use-sidebar-actions";

export interface SidebarHandle {
    openProjectModal: () => void;
    openImportModal: () => void;
}

export const Sidebar = forwardRef<
    SidebarHandle,
    {
        selectedEndpointId: string | null;
        onSelectEndpoint: (id: string, projectId: string) => void;
        selectedProjectId: string | null;
        onSelectProject: (id: string) => void;
    }
>(function Sidebar(
    { selectedEndpointId, onSelectEndpoint, selectedProjectId, onSelectProject },
    ref,
) {
    const {
        projects,
        isLoadingProjects,
        renamingId,
        setRenamingId,
        modal,
        setModal,
        confirmState,
        setConfirmState,
        confirmDangerousAction,
        handleExportProject,
        createFolder,
        deleteFolder,
        updateFolder,
        createProject,
        deleteProject,
        updateProject,
        importProject,
        createEndpoint,
        deleteEndpoint,
        updateEndpoint,
    } = useSidebarActions();

    useImperativeHandle(ref, () => ({
        openProjectModal: () => setModal({ kind: "project" }),
        openImportModal: () => setModal({ kind: "importProject" }),
    }));

    return (
        <>
            <aside className="flex h-full w-full flex-col bg-background">
                <div className="flex-1 overflow-y-auto">
                    {isLoadingProjects ? (
                        <SidebarSkeleton />
                    ) : projects.length === 0 ? (
                        <div className="mt-10 flex flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground">
                            <p>No projects yet.</p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setModal({ kind: "project" })}
                                >
                                    <Plus className="mr-1 h-3 w-3" /> New project
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setModal({ kind: "importProject" })}
                                >
                                    <Upload className="mr-1 h-3 w-3" /> Import
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <TreeProvider showLines indent={16} animateExpand>
                            <TreeView className="py-1">
                                {projects.map((project, index) => (
                                    <ProjectTreeNode
                                        key={project.id}
                                        project={project as SidebarProject}
                                        level={0}
                                        isLast={index === projects.length - 1}
                                        selectedEndpointId={selectedEndpointId}
                                        onSelectEndpoint={onSelectEndpoint}
                                        selectedProjectId={selectedProjectId}
                                        onSelectProject={onSelectProject}
                                        renamingId={renamingId}
                                        setRenamingId={setRenamingId}
                                        onRenameProject={(id, name) =>
                                            updateProject.mutate({ id, title: name })
                                        }
                                        onRenameFolder={(id, name) =>
                                            updateFolder.mutate({ id, name })
                                        }
                                        onRenameEndpoint={(id, name) =>
                                            updateEndpoint.mutate({ id, name })
                                        }
                                        onOpenModal={setModal}
                                        onExportProject={handleExportProject}
                                        onDeleteProject={(id) =>
                                            confirmDangerousAction(
                                                "Delete project?",
                                                "This will permanently remove the project and all its contents.",
                                                () => {
                                                    deleteProject.mutate(
                                                        { id },
                                                        {
                                                            onSuccess: () => {
                                                                const remainingProjects =
                                                                    projects.filter(
                                                                        (p) => p.id !== id,
                                                                    );
                                                                if (
                                                                    remainingProjects.length > 0 &&
                                                                    remainingProjects[0]
                                                                ) {
                                                                    onSelectProject(
                                                                        remainingProjects[0].id,
                                                                    );
                                                                }
                                                            },
                                                        },
                                                    );
                                                },
                                            )
                                        }
                                        onDeleteFolder={(id) =>
                                            confirmDangerousAction(
                                                "Delete folder?",
                                                "This will permanently delete the folder and everything inside it.",
                                                () => deleteFolder.mutate({ id }),
                                            )
                                        }
                                        onDeleteEndpoint={(id) =>
                                            confirmDangerousAction(
                                                "Delete endpoint?",
                                                "This will permanently remove the endpoint from the project.",
                                                () => deleteEndpoint.mutate({ id }),
                                            )
                                        }
                                    />
                                ))}
                            </TreeView>
                        </TreeProvider>
                    )}
                </div>
            </aside>

            {confirmState ? (
                <ConfirmDialog
                    open={confirmState.open}
                    onOpenChange={(open) => {
                        if (!open) setConfirmState(null);
                    }}
                    title={confirmState.title}
                    description={confirmState.description}
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    destructive
                    onConfirm={() => {
                        confirmState.onConfirm();
                        setConfirmState(null);
                    }}
                />
            ) : null}

            <CreateProjectDialog
                open={modal?.kind === "project"}
                onOpenChange={(open) => {
                    if (!open) setModal(null);
                }}
                onCreate={(title, basePath) => {
                    createProject.mutate(
                        { title, basePath },
                        {
                            onSuccess: (res) => {
                                if (res && "id" in res) {
                                    onSelectProject(res.id as string);
                                }
                            },
                        },
                    );
                    setModal(null);
                }}
            />
            <ImportProjectDialog
                open={modal?.kind === "importProject"}
                onOpenChange={(open) => {
                    if (!open) setModal(null);
                }}
                onImport={(data) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    importProject.mutate(data as any, {
                        onSuccess: (res) => {
                            setModal(null);
                            if (res.projectId) {
                                onSelectProject(res.projectId);
                            }
                        },
                    });
                }}
                isImporting={importProject.isPending}
            />
            <CreateFolderDialog
                open={modal?.kind === "folder"}
                onOpenChange={(open) => {
                    if (!open) setModal(null);
                }}
                onCreate={(name) => {
                    if (modal?.kind !== "folder") return;
                    createFolder.mutate({
                        name,
                        projectId: modal.projectId,
                        parentId: modal.parentId,
                    });
                    setModal(null);
                }}
            />
            <CreateEndpointDialog
                open={modal?.kind === "endpoint"}
                onOpenChange={(open) => {
                    if (!open) setModal(null);
                }}
                onCreate={(name, method, path) => {
                    if (modal?.kind !== "endpoint") return;
                    const normalizedPath =
                        path === "/" ? `/${name.toLowerCase().replaceAll(" ", "-")}` : path;
                    createEndpoint.mutate({
                        name,
                        method,
                        path: normalizedPath.startsWith("/")
                            ? normalizedPath
                            : `/${normalizedPath}`,
                        projectId: modal.projectId,
                        folderId: modal.folderId,
                    });
                    setModal(null);
                }}
            />
            <ProjectSettingsDialog
                projectId={modal?.kind === "projectSettings" ? modal.projectId : null}
                open={modal?.kind === "projectSettings"}
                onOpenChange={(open) => {
                    if (!open) setModal(null);
                }}
            />
        </>
    );
});
