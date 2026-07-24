"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontalIcon, FolderPlusIcon, PencilIcon, TrashIcon, FilePlus2 } from "lucide-react";

export function TreeNodeMenu({
    onNewFolder,
    onNewFile,
    onRename,
    onDelete,
    showNewFolder = true,
    showNewFile = true,
}: {
    onNewFolder?: () => void;
    onNewFile?: () => void;
    onRename: () => void;
    onDelete: () => void;
    showNewFolder?: boolean;
    showNewFile?: boolean;
}) {
    return (
        <div onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <button
                            className="ml-auto flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 data-[state=open]:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontalIcon className="h-3.5 w-3.5" />
                        </button>
                    }
                />

                <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    {showNewFolder && onNewFolder && (
                        <DropdownMenuItem onClick={onNewFolder}>
                            <FolderPlusIcon className="mr-2 h-4 w-4" /> New folder
                        </DropdownMenuItem>
                    )}
                    {showNewFile && onNewFile && (
                        <DropdownMenuItem onClick={onNewFile}>
                            <FilePlus2 className="mr-2 h-4 w-4" /> New endpoint
                        </DropdownMenuItem>
                    )}
                    {(showNewFolder || showNewFile) && (onNewFolder ?? onNewFile) && (
                        <DropdownMenuSeparator />
                    )}
                    <DropdownMenuItem onClick={onRename}>
                        <PencilIcon className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                        <TrashIcon className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
