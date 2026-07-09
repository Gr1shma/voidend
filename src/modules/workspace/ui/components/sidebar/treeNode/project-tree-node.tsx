"use client";

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
import { InlineRename } from "../inline-rename";
import { FolderTreeNode } from "./folder-tree-node";
import { EndpointTreeNode } from "./endpoint-tree-node";
import { buildFolderTree, type FolderRow } from "../folder-item";
import type { Collection, Endpoint } from "../endpoint-item";
import type { ModalTarget, SidebarProject } from "../sidebar-types";
import { useEndpoints } from "~/hooks/use-endpoints";
import { useFolders } from "~/hooks/use-folders";

type ProjectTreeNodeProps = {
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
    onDeleteProject: (id: string) => void;
    onDeleteFolder: (id: string) => void;
    onDeleteEndpoint: (id: string) => void;
};

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
    onDeleteProject,
    onDeleteFolder,
    onDeleteEndpoint,
}: ProjectTreeNodeProps) {
    const { data: rawFolders = [] } = useFolders(project.id);
    const { data: rawEndpoints = [] } = useEndpoints(project.id);

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
            <TreeNodeTrigger className="group" onClick={() => onSelectProject(project.id)}>
                <TreeExpander hasChildren />
                <TreeIcon hasChildren />
                {renamingId === project.id ? (
                    <InlineRename
                        defaultValue={project.title}
                        onConfirm={(name) => {
                            onRenameProject(project.id, name);
                            setRenamingId(null);
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
                    onRename={() => setRenamingId(project.id)}
                    onDelete={() => onDeleteProject(project.id)}
                />
            </TreeNodeTrigger>

            <TreeNodeContent hasChildren>
                {rootEndpoints.map((endpoint) => (
                    <EndpointTreeNode
                        key={endpoint.id}
                        endpoint={endpoint}
                        level={level + 1}
                        isSelected={selectedEndpointId === endpoint.id}
                        isRenaming={renamingId === endpoint.id}
                        onSelect={() => onSelectEndpoint(endpoint.id, project.id)}
                        onRenameConfirm={(name) => {
                            onRenameEndpoint(endpoint.id, name);
                            setRenamingId(null);
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
            </TreeNodeContent>
        </TreeNode>
    );
}
