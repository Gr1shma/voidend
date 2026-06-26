"use client";

import {
    TreeNode,
    TreeNodeTrigger,
    TreeExpander,
    TreeIcon,
    TreeLabel,
} from "~/components/kibo-ui/tree";
import { TreeNodeMenu } from "./tree-node-menu";
import { InlineRename } from "../inline-rename";
import { MethodBadge, type HttpMethod } from "../endpoint-item";
import type { Endpoint } from "../endpoint-item";

type EndpointTreeNodeProps = {
    endpoint: Endpoint;
    level: number;
    isSelected: boolean;
    isRenaming: boolean;
    onSelect: () => void;
    onRenameConfirm: (name: string) => void;
    onRenameCancel: () => void;
    onRenameStart: () => void;
    onDelete: () => void;
};

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
}: EndpointTreeNodeProps) {
    return (
        <TreeNode nodeId={endpoint.id} level={level} isLast={false}>
            <TreeNodeTrigger className="group" onClick={onSelect}>
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
                <MethodBadge method={endpoint.method as HttpMethod} />
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
