"use client";

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
import { EndpointTreeNode } from "./endpoint-tree-node";
import type { Collection, Endpoint } from "../endpoint-item";
import type { ModalTarget } from "../sidebar-types";

type FolderTreeNodeProps = {
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
};

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
}: FolderTreeNodeProps) {
    const hasChildren =
        (collection.children?.length ?? 0) > 0 || (collection.endpoints?.length ?? 0) > 0;

    const folderEndpoints = endpoints.filter((endpoint) => endpoint.folderId === collection.id);

    return (
        <TreeNode nodeId={collection.id} level={level} isLast={isLast}>
            <TreeNodeTrigger className="group">
                <TreeExpander hasChildren={hasChildren} />
                <TreeIcon hasChildren={hasChildren} />
                {renamingId === collection.id ? (
                    <InlineRename
                        defaultValue={collection.name}
                        onConfirm={(name) => {
                            onRenameFolder(collection.id, name);
                            setRenamingId(null);
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
                            onRenameEndpoint(endpoint.id, name);
                            setRenamingId(null);
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
