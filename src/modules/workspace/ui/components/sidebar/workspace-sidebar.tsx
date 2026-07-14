"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ConfirmDialog } from "~/components/confirm-dialog";
import { TreeProvider, TreeView } from "~/components/kibo-ui/tree";
import { CreateFolderDialog, CreateEndpointDialog, CreateProjectDialog } from "./dialogs";
import { ProjectTreeNode } from "./sidebar-tree";
import {
    useCreateProject,
    useDeleteProject,
    useProjects,
    useUpdateProject,
} from "~/hooks/use-projects";
import { useCreateFolder, useDeleteFolder, useRenameFolder } from "~/hooks/use-folders";
import { useCreateEndpoint, useDeleteEndpoint, useUpdateEndpoint } from "~/hooks/use-endpoints";
import type { ModalTarget, SidebarProject } from "./types";

export interface SidebarHandle {
    openProjectModal: () => void;
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
    const { data: projects = [] } = useProjects();
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalTarget | null>(null);
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    } | null>(null);

    const createFolder = useCreateFolder();
    const deleteFolder = useDeleteFolder();
    const updateFolder = useRenameFolder();
    const createProject = useCreateProject();
    const deleteProject = useDeleteProject();
    const updateProject = useUpdateProject();
    const createEndpoint = useCreateEndpoint();
    const deleteEndpoint = useDeleteEndpoint();
    const updateEndpoint = useUpdateEndpoint();

    useImperativeHandle(ref, () => ({
        openProjectModal: () => setModal({ kind: "project" }),
    }));

    const confirmDangerousAction = (title: string, description: string, onConfirm: () => void) => {
        setConfirmState({ open: true, title, description, onConfirm });
    };

    return (
        <>
            <aside className="flex h-full w-full flex-col bg-background">
                <div className="flex-1 overflow-y-auto">
                    {projects.length === 0 ? (
                        <div className="mt-10 flex flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground">
                            <p>No projects yet.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setModal({ kind: "project" })}
                            >
                                <Plus className="mr-1 h-3 w-3" /> New project
                            </Button>
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
                                        onDeleteProject={(id) =>
                                            confirmDangerousAction(
                                                "Delete project?",
                                                "This will permanently remove the project and all its contents.",
                                                () => deleteProject.mutate({ id }),
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
                    createProject.mutate({ title, basePath });
                    setModal(null);
                }}
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
        </>
    );
});
