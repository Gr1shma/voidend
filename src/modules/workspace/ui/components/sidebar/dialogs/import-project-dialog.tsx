import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export function ImportProjectDialog({
    open,
    onOpenChange,
    onImport,
    isImporting,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (data: unknown) => void;
    isImporting: boolean;
}) {
    const [jsonContent, setJsonContent] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
            const content = event.target?.result as string;
            setJsonContent(content);
            setError(null);
        });
        reader.readAsText(file);
    };

    const handleSubmit = () => {
        try {
            setError(null);
            const parsed = JSON.parse(jsonContent);
            onImport(parsed);
        } catch {
            setError("Invalid JSON format. Please select or paste a valid exported project JSON.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Import Project</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                            Select exported JSON file
                        </label>
                        <Input
                            type="file"
                            accept=".json,application/json"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                            Or paste JSON content
                        </label>
                        <textarea
                            className="w-full h-40 p-2 text-xs font-mono rounded-md border bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                            placeholder="Paste project export JSON here..."
                            value={jsonContent}
                            onChange={(e) => {
                                setJsonContent(e.target.value);
                                setError(null);
                            }}
                        />
                    </div>

                    {error && <p className="text-xs font-medium text-destructive">{error}</p>}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!jsonContent.trim() || isImporting}>
                        {isImporting ? "Importing..." : "Import Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
