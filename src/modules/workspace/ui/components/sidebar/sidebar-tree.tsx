"use client";

import { KeyRound, Lock } from "lucide-react";
import { cn } from "~/lib/utils";
import {
    TreeNode,
    TreeNodeTrigger,
    TreeNodeContent,
    TreeExpander,
    TreeIcon,
    TreeLabel,
} from "~/components/kibo-ui/tree";
import { TreeNodeMenu } from "./tree-node-menu";
import { InlineRename } from "./inline-rename";
import { MethodBadge } from "./method-badge";
import {
    buildFolderTree,
    type FolderRow,
    type Collection,
    type Endpoint,
    type ModalTarget,
    type SidebarProject,
} from "./types";
import { useEndpoints } from "~/hooks/use-endpoints";
import { useFolders } from "~/hooks/use-folders";
import { ProjectTreeNodeSkeleton } from "./sidebar-skeleton";

function commitRename<T extends string>(
    currentName: string,
    nextName: string,
    onRename: (name: T) => void,
    onFinish: () => void,
) {
    const normalizedName = nextName.trim() || currentName;

    if (normalizedName !== currentName) {
        onRename(normalizedName as T);
    }

    onFinish();
}

export function EndpointTreeNode({
    endpoint,
    level,
    isSelected,
    isRenaming,
    onSelect,
    onRenameConfirm,
    onRenameCancel,
    onRenameStart,
    onDelete,
}: {
    endpoint: Endpoint;
    level: number;
    isSelected: boolean;
    isRenaming: boolean;
    onSelect: () => void;
    onRenameConfirm: (name: string) => void;
    onRenameCancel: () => void;
    onRenameStart: () => void;
    onDelete: () => void;
}) {
    return (
        <TreeNode nodeId={endpoint.id} level={level} isLast={false}>
            <TreeNodeTrigger
                className="group"
                onClick={onSelect}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    onRenameStart();
                }}
            >
                <TreeExpander hasChildren={false} />
                <TreeIcon hasChildren={false} />
                {isRenaming ? (
                    <InlineRename
                        defaultValue={endpoint.name}
                        onConfirm={onRenameConfirm}
                        onCancel={onRenameCancel}
                    />
                ) : (
                    <TreeLabel className={isSelected ? "font-medium" : ""}>
                        {endpoint.name}
                    </TreeLabel>
                )}
                {endpoint.authConfig?.isLoginEndpoint && (
                    <span
                        className="inline-flex items-center justify-center rounded border border-amber-500/30 bg-amber-500/15 p-0.5 text-amber-600 dark:text-amber-400 shrink-0 mr-1.5"
                        title="Login Endpoint (Returns JWT Token)"
                    >
                        <KeyRound className="size-3" />
                    </span>
                )}
                {endpoint.authConfig?.requiresAuth && (
                    <span
                        className="inline-flex items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/15 p-0.5 text-emerald-600 dark:text-emerald-400 shrink-0 mr-1.5"
                        title="Requires Authentication (Bearer Token)"
                    >
                        <Lock className="size-3" />
                    </span>
                )}
                <MethodBadge method={endpoint.method} />
                <TreeNodeMenu
                    showNewFolder={false}
                    showNewFile={false}
                    onRename={onRenameStart}
                    onDelete={onDelete}
                />
            </TreeNodeTrigger>
        </TreeNode>
    );
}

export function FolderTreeNode({
    collection,
    level,
    isLast,
    projectId,
    selectedEndpointId,
    onSelectEndpoint,
    renamingId,
    setRenamingId,
    onRenameFolder,
    onRenameEndpoint,
    onOpenModal,
    onDeleteFolder,
    onDeleteEndpoint,
    endpoints,
}: {
    collection: Collection;
    level: number;
    isLast: boolean;
    projectId: string;
    selectedEndpointId: string | null;
    onSelectEndpoint: (id: string, projectId: string) => void;
    renamingId: string | null;
    setRenamingId: (id: string | null) => void;
    onRenameFolder: (id: string, name: string) => void;
    onRenameEndpoint: (id: string, name: string) => void;
    onOpenModal: (target: ModalTarget) => void;
    onDeleteFolder: (id: string) => void;
    onDeleteEndpoint: (id: string) => void;
    endpoints: Endpoint[];
}) {
    const hasChildren =
        (collection.children?.length ?? 0) > 0 || (collection.endpoints?.length ?? 0) > 0;

    const folderEndpoints = endpoints.filter((endpoint) => endpoint.folderId === collection.id);

    return (
        <TreeNode nodeId={collection.id} level={level} isLast={isLast}>
            <TreeNodeTrigger
                className="group"
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    setRenamingId(collection.id);
                }}
            >
                <TreeExpander hasChildren={hasChildren} />
                <TreeIcon hasChildren={hasChildren} />
                {renamingId === collection.id ? (
                    <InlineRename
                        defaultValue={collection.name}
                        onConfirm={(name) => {
                            commitRename(
                                collection.name,
                                name,
                                (nextName) => {
                                    onRenameFolder(collection.id, nextName);
                                },
                                () => setRenamingId(null),
                            );
                        }}
                        onCancel={() => setRenamingId(null)}
                    />
                ) : (
                    <TreeLabel>{collection.name}</TreeLabel>
                )}
                <TreeNodeMenu
                    onNewFolder={() =>
                        onOpenModal({ kind: "folder", projectId, parentId: collection.id })
                    }
                    onNewFile={() =>
                        onOpenModal({
                            kind: "endpoint",
                            projectId,
                            folderId: collection.id,
                        })
                    }
                    onRename={() => setRenamingId(collection.id)}
                    onDelete={() => onDeleteFolder(collection.id)}
                />
            </TreeNodeTrigger>

            <TreeNodeContent hasChildren={hasChildren}>
                {(collection.children ?? []).map((child, index) => (
                    <FolderTreeNode
                        key={child.id}
                        collection={child}
                        level={level + 1}
                        isLast={
                            index === (collection.children?.length ?? 0) - 1 &&
                            (collection.endpoints?.length ?? 0) === 0
                        }
                        projectId={projectId}
                        selectedEndpointId={selectedEndpointId}
                        onSelectEndpoint={onSelectEndpoint}
                        renamingId={renamingId}
                        setRenamingId={setRenamingId}
                        onRenameFolder={onRenameFolder}
                        onRenameEndpoint={onRenameEndpoint}
                        onOpenModal={onOpenModal}
                        onDeleteFolder={onDeleteFolder}
                        onDeleteEndpoint={onDeleteEndpoint}
                        endpoints={endpoints}
                    />
                ))}
                {folderEndpoints.map((endpoint) => (
                    <EndpointTreeNode
                        key={endpoint.id}
                        endpoint={endpoint}
                        level={level + 1}
                        isSelected={selectedEndpointId === endpoint.id}
                        isRenaming={renamingId === endpoint.id}
                        onSelect={() => onSelectEndpoint(endpoint.id, projectId)}
                        onRenameConfirm={(name) => {
                            commitRename(
                                endpoint.name,
                                name,
                                (nextName) => {
                                    onRenameEndpoint(endpoint.id, nextName);
                                },
                                () => setRenamingId(null),
                            );
                        }}
                        onRenameCancel={() => setRenamingId(null)}
                        onRenameStart={() => setRenamingId(endpoint.id)}
                        onDelete={() => onDeleteEndpoint(endpoint.id)}
                    />
                ))}
            </TreeNodeContent>
        </TreeNode>
    );
}

export function ProjectTreeNode({
    project,
    level,
    isLast,
    selectedEndpointId,
    onSelectEndpoint,
    selectedProjectId,
    onSelectProject,
    renamingId,
    setRenamingId,
    onRenameProject,
    onRenameFolder,
    onRenameEndpoint,
    onOpenModal,
    onExportProject,
    onDeleteProject,
    onDeleteFolder,
    onDeleteEndpoint,
}: {
    project: SidebarProject;
    level: number;
    isLast: boolean;
    selectedEndpointId: string | null;
    onSelectEndpoint: (id: string, projectId: string) => void;
    selectedProjectId: string | null;
    onSelectProject: (id: string) => void;
    renamingId: string | null;
    setRenamingId: (id: string | null) => void;
    onRenameProject: (id: string, name: string) => void;
    onRenameFolder: (id: string, name: string) => void;
    onRenameEndpoint: (id: string, name: string) => void;
    onOpenModal: (target: ModalTarget) => void;
    onExportProject?: (id: string) => void;
    onDeleteProject: (id: string) => void;
    onDeleteFolder: (id: string) => void;
    onDeleteEndpoint: (id: string) => void;
}) {
    const { data: rawFolders = [], isLoading: isLoadingFolders } = useFolders(project.id);
    const { data: rawEndpoints = [], isLoading: isLoadingEndpoints } = useEndpoints(project.id);

    const isLoading = isLoadingFolders || isLoadingEndpoints;

    const folderTree = buildFolderTree(rawFolders as FolderRow[]);

    const attachEndpoints = (collections: Collection[]): Collection[] =>
        collections.map((collection) => ({
            ...collection,
            endpoints: rawEndpoints.filter(
                (endpoint) => endpoint.folderId === collection.id,
            ) as Endpoint[],
            children: attachEndpoints(collection.children ?? []),
        }));

    const tree = attachEndpoints(folderTree);
    const rootEndpoints = rawEndpoints.filter((endpoint) => !endpoint.folderId) as Endpoint[];

    return (
        <TreeNode nodeId={project.id} level={level} isLast={isLast}>
            <TreeNodeTrigger
                className="group"
                onClick={() => onSelectProject(project.id)}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    setRenamingId(project.id);
                }}
            >
                <TreeExpander hasChildren />
                <TreeIcon hasChildren />
                {renamingId === project.id ? (
                    <InlineRename
                        defaultValue={project.title}
                        onConfirm={(name) => {
                            commitRename(
                                project.title,
                                name,
                                (nextName) => {
                                    onRenameProject(project.id, nextName);
                                },
                                () => setRenamingId(null),
                            );
                        }}
                        onCancel={() => setRenamingId(null)}
                    />
                ) : (
                    <TreeLabel
                        className={cn(
                            "font-medium",
                            selectedProjectId === project.id && "font-bold text-primary",
                        )}
                    >
                        {project.title}
                    </TreeLabel>
                )}
                <TreeNodeMenu
                    onNewFolder={() => onOpenModal({ kind: "folder", projectId: project.id })}
                    onNewFile={() => onOpenModal({ kind: "endpoint", projectId: project.id })}
                    onSettings={() =>
                        onOpenModal({ kind: "projectSettings", projectId: project.id })
                    }
                    onExport={onExportProject ? () => onExportProject(project.id) : undefined}
                    onRename={() => setRenamingId(project.id)}
                    onDelete={() => onDeleteProject(project.id)}
                />
            </TreeNodeTrigger>

            <TreeNodeContent hasChildren>
                {isLoading ? (
                    <ProjectTreeNodeSkeleton level={level + 1} />
                ) : (
                    <>
                        {rootEndpoints.map((endpoint) => (
                            <EndpointTreeNode
                                key={endpoint.id}
                                endpoint={endpoint}
                                level={level + 1}
                                isSelected={selectedEndpointId === endpoint.id}
                                isRenaming={renamingId === endpoint.id}
                                onSelect={() => onSelectEndpoint(endpoint.id, project.id)}
                                onRenameConfirm={(name) => {
                                    commitRename(
                                        endpoint.name,
                                        name,
                                        (nextName) => {
                                            onRenameEndpoint(endpoint.id, nextName);
                                        },
                                        () => setRenamingId(null),
                                    );
                                }}
                                onRenameCancel={() => setRenamingId(null)}
                                onRenameStart={() => setRenamingId(endpoint.id)}
                                onDelete={() => onDeleteEndpoint(endpoint.id)}
                            />
                        ))}
                        {tree.map((collection, index) => (
                            <FolderTreeNode
                                key={collection.id}
                                collection={collection}
                                level={level + 1}
                                isLast={index === tree.length - 1}
                                projectId={project.id}
                                selectedEndpointId={selectedEndpointId}
                                onSelectEndpoint={onSelectEndpoint}
                                renamingId={renamingId}
                                setRenamingId={setRenamingId}
                                onRenameFolder={onRenameFolder}
                                onRenameEndpoint={onRenameEndpoint}
                                onOpenModal={onOpenModal}
                                onDeleteFolder={onDeleteFolder}
                                onDeleteEndpoint={onDeleteEndpoint}
                                endpoints={rawEndpoints as Endpoint[]}
                            />
                        ))}
                    </>
                )}
            </TreeNodeContent>
        </TreeNode>
    );
}
