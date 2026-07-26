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
import { EndpointTreeNode } from "./endpoint-tree-node";
import { commitRename } from "./tree-utils";
import type { Collection, Endpoint, ModalTarget } from "./types";

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
