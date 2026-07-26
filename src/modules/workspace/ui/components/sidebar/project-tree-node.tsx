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
import { EndpointTreeNode } from "./endpoint-tree-node";
import { FolderTreeNode } from "./folder-tree-node";
import { commitRename } from "./tree-utils";
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
