import { KeyRound, Lock } from "lucide-react";
import { TreeNode, TreeNodeTrigger, TreeExpander, TreeLabel } from "~/components/kibo-ui/tree";
import { TreeNodeMenu } from "./tree-node-menu";
import { InlineRename } from "./inline-rename";
import { MethodBadge } from "./method-badge";
import type { Endpoint } from "./types";

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
                <MethodBadge method={endpoint.method} className="w-auto mr-1.5 text-[9px]" />
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
