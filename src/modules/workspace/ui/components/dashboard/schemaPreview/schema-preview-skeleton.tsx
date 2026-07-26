import { Card, CardContent, CardHeader } from "~/components/ui/card";

function MockCodeBlock() {
    return (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-4 font-mono text-sm space-y-2">
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-zinc-800 animate-pulse" />
                <div className="w-24 h-4 rounded bg-zinc-800 animate-pulse" />
            </div>
            <div className="pl-6 space-y-2">
                <div className="w-1/2 h-4 rounded bg-zinc-800 animate-pulse" />
                <div className="w-3/4 h-4 rounded bg-zinc-800 animate-pulse" />
                <div className="w-2/3 h-4 rounded bg-zinc-800 animate-pulse" />
                <div className="w-1/3 h-4 rounded bg-zinc-800 animate-pulse" />
            </div>
            <div className="w-8 h-4 rounded bg-zinc-800 animate-pulse" />
        </div>
    );
}

export function SchemaPreviewSkeleton() {
    return (
        <div className="w-full mx-auto px-6 pb-6 h-full">
            <Card className="border shadow-lg bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
                        <div className="w-36 h-6 rounded bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
                    </div>
                    <div className="w-24 h-8 rounded bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="grid grid-cols-2 bg-zinc-200 dark:bg-zinc-900/50 px-4 py-2">
                            <div className="w-12 h-3 rounded bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
                            <div className="w-12 h-3 rounded bg-zinc-300 dark:bg-zinc-700 animate-pulse" />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="grid grid-cols-2 px-4 py-3 border-t border-zinc-150 dark:border-zinc-800/50"
                            >
                                <div className="w-24 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                                <div className="w-16 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <div className="w-20 h-6 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <div className="w-28 h-6 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <div className="w-16 h-6 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="w-28 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                            <div className="w-28 h-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        </div>
                        <MockCodeBlock />
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="w-36 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                            <div className="w-24 h-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        </div>
                        <div className="w-3/4 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <MockCodeBlock />
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="w-32 h-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                            <div className="w-48 h-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        </div>
                        <div className="w-2/3 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                        <MockCodeBlock />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
