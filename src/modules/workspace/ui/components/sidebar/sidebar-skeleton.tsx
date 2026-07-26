import { Skeleton } from "~/components/ui/skeleton";

export function SidebarSkeleton() {
    return (
        <div className="space-y-1 p-2 py-3">
            {[1, 2, 3].map((i) => (
                <ProjectRowSkeleton key={i} />
            ))}
        </div>
    );
}

function ProjectRowSkeleton() {
    return (
        <div className="mx-1 flex items-center gap-2 rounded-md px-3 py-2">
            <Skeleton className="h-3 w-3 shrink-0 rounded-sm" />
            <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
            <Skeleton className="h-3.5 flex-1 rounded" />
        </div>
    );
}

export function ProjectTreeNodeSkeleton({ level }: { level: number }) {
    const indent = level * 16 + 8;

    return (
        <div className="space-y-1">
            {[1, 2, 3].map((i) => (
                <TreeRowSkeleton key={i} indent={indent} />
            ))}
        </div>
    );
}

function TreeRowSkeleton({ indent }: { indent: number }) {
    return (
        <div
            className="mx-1 flex items-center gap-2 rounded-md px-3 py-2"
            style={{ paddingLeft: indent }}
        >
            <Skeleton className="h-3 w-3 shrink-0 rounded-sm" />
            <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
            <Skeleton className="h-3.5 rounded" style={{ width: `${40 + (indent % 30)}%` }} />
        </div>
    );
}
