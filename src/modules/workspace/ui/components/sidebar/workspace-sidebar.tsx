"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TreeProvider, TreeView } from "~/components/kibo-ui/tree";
import { CreateFolderDialog } from "./dialog/create-folder-dialog";
import { CreateEndpointDialog } from "./dialog/create-endpoint-dialog";
import { CreateProjectDialog } from "./dialog/create-project-dialog";
import { ProjectTreeNode } from "./treeNode/project-tree-node";
import {
    useCreateProject,
    useDeleteProject,
    useProjects,
    useUpdateProject,
} from "~/hooks/use-projects";
import { useCreateFolder, useDeleteFolder, useRenameFolder } from "~/hooks/use-folders";
import { useCreateEndpoint, useDeleteEndpoint, useUpdateEndpoint } from "~/hooks/use-endpoints";
import type { ModalTarget, SidebarProject } from "./sidebar-types";

export function Sidebar({
    selectedEndpointId,
    onSelectEndpoint,
    selectedProjectId,
    onSelectProject,
}: {
    selectedEndpointId: string | null;
    onSelectEndpoint: (id: string, projectId: string) => void;
    selectedProjectId: string | null;
    onSelectProject: (id: string) => void;
}) {
    const { data: projects = [] } = useProjects();
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalTarget | null>(null);

    const createFolder = useCreateFolder();
    const deleteFolder = useDeleteFolder();
    const updateFolder = useRenameFolder();

    const createProject = useCreateProject();
    const deleteProject = useDeleteProject();
    const updateProject = useUpdateProject();

    const createEndpoint = useCreateEndpoint();
    const deleteEndpoint = useDeleteEndpoint();
    const updateEndpoint = useUpdateEndpoint();

    return (
        <>
            <aside className="flex h-full w-60 flex-col border-r bg-background">
                <div className="flex items-center justify-between border-b px-3 py-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Collections
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setModal({ kind: "project" })}
                        title="New project"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </Button>
                </div>

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
                                        onDeleteProject={(id) => deleteProject.mutate({ id })}
                                        onDeleteFolder={(id) => deleteFolder.mutate({ id })}
                                        onDeleteEndpoint={(id) => deleteEndpoint.mutate({ id })}
                                    />
                                ))}
                            </TreeView>
                        </TreeProvider>
                    )}
                </div>
            </aside>

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
}
