import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { fieldsFromSchema } from "~/lib/faker-options";
import type { SchemaField } from "~/lib/faker-options";

interface RawJsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
    onErrorChange: (error: string | null) => void;
    onFieldsSync: (fields: SchemaField[]) => void;
    onSubmit: () => void;
    isPending: boolean;
    hasJsonError: boolean;
    hasExistingSchema: boolean;
}

export function RawJsonEditor({
    value,
    onChange,
    error,
    onErrorChange,
    onFieldsSync,
    onSubmit,
    isPending,
    hasJsonError,
    hasExistingSchema,
}: RawJsonEditorProps) {
    function handleChange(val: string) {
        onChange(val);
        try {
            const parsed = JSON.parse(val);
            onFieldsSync(fieldsFromSchema(parsed));
            onErrorChange(null);
        } catch (err: any) {
            onErrorChange(err.message || "Invalid JSON syntax");
        }
    }

    function handleFormat() {
        try {
            const parsed = JSON.parse(value);
            const formatted = JSON.stringify(parsed, null, 2);
            onChange(formatted);
            onErrorChange(null);
            toast.success("JSON formatted");
        } catch {
            toast.error("Cannot format: invalid JSON syntax");
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        const target = e.currentTarget;
        const { selectionStart, selectionEnd, value: val } = target;

        // Convert single quote to double quote
        if (e.key === "'") {
            e.preventDefault();
            const before = val.substring(0, selectionStart);
            const after = val.substring(selectionEnd);
            const nextVal = `${before}"${after}`;
            onChange(nextVal);
            setTimeout(() => {
                target.selectionStart = target.selectionEnd = selectionStart + 1;
            }, 0);
            return;
        }

        // Auto-pair double quotes
        if (e.key === '"') {
            if (selectionStart === selectionEnd && val[selectionStart] === '"') {
                e.preventDefault();
                target.selectionStart = target.selectionEnd = selectionStart + 1;
                return;
            }
            e.preventDefault();
            const before = val.substring(0, selectionStart);
            const selected = val.substring(selectionStart, selectionEnd);
            const after = val.substring(selectionEnd);
            const nextVal = `${before}"${selected}"${after}`;
            onChange(nextVal);
            setTimeout(() => {
                target.selectionStart = selectionStart + 1;
                target.selectionEnd = selectionStart + 1 + selected.length;
            }, 0);
            return;
        }

        // Auto-pair braces and brackets
        if (e.key === "{" || e.key === "[") {
            const closing = e.key === "{" ? "}" : "]";
            e.preventDefault();
            const before = val.substring(0, selectionStart);
            const selected = val.substring(selectionStart, selectionEnd);
            const after = val.substring(selectionEnd);
            const nextVal = `${before}${e.key}${selected}${closing}${after}`;
            onChange(nextVal);
            setTimeout(() => {
                target.selectionStart = selectionStart + 1;
                target.selectionEnd = selectionStart + 1 + selected.length;
            }, 0);
            return;
        }

        // Tab key -> 2 spaces
        if (e.key === "Tab") {
            e.preventDefault();
            const before = val.substring(0, selectionStart);
            const after = val.substring(selectionEnd);
            const nextVal = `${before}  ${after}`;
            onChange(nextVal);
            setTimeout(() => {
                target.selectionStart = target.selectionEnd = selectionStart + 2;
            }, 0);
            return;
        }

        // Enter key -> smart auto-indent
        if (e.key === "Enter") {
            e.preventDefault();
            const lineStart = val.lastIndexOf("\n", selectionStart - 1) + 1;
            const currentLine = val.substring(lineStart, selectionStart);
            const matchIndent = currentLine.match(/^(\s*)/);
            let indent = matchIndent ? (matchIndent[1] ?? "") : "";

            const charBeforeCursor = val[selectionStart - 1];
            const charAfterCursor = val[selectionEnd];

            if (charBeforeCursor === "{" || charBeforeCursor === "[") {
                indent += "  ";
            }

            if (
                (charBeforeCursor === "{" && charAfterCursor === "}") ||
                (charBeforeCursor === "[" && charAfterCursor === "]")
            ) {
                const outerIndent = (indent ?? "").slice(0, Math.max(0, (indent ?? "").length - 2));
                const before = val.substring(0, selectionStart);
                const after = val.substring(selectionEnd);
                const nextVal = `${before}\n${indent ?? ""}\n${outerIndent}${after}`;
                onChange(nextVal);
                setTimeout(() => {
                    target.selectionStart = target.selectionEnd =
                        selectionStart + 1 + (indent ?? "").length;
                }, 0);
                return;
            }

            const before = val.substring(0, selectionStart);
            const after = val.substring(selectionEnd);
            const nextVal = `${before}\n${indent ?? ""}${after}`;
            onChange(nextVal);
            setTimeout(() => {
                target.selectionStart = target.selectionEnd =
                    selectionStart + 1 + (indent ?? "").length;
            }, 0);
            return;
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                    JSON Editor (Tab / Enter auto-indent, &quot; auto-pairs)
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFormat}
                    className="h-7 text-xs font-mono gap-1"
                >
                    Format JSON
                </Button>
            </div>
            <textarea
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`{\n  "id": "$faker.string.uuid",\n  "user": {\n    "name": "$faker.person.fullName"\n  }\n}`}
                rows={10}
                className="w-full rounded-md border border-input bg-zinc-950 text-zinc-100 p-3 font-mono text-xs shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring leading-relaxed"
            />
            {error && <p className="text-xs font-mono text-destructive">JSON Error: {error}</p>}
            <div className="flex justify-end pt-1">
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isPending || hasJsonError}
                    size="sm"
                    className="h-9 gap-2 font-semibold text-primary-foreground"
                >
                    {isPending
                        ? "Saving..."
                        : hasExistingSchema
                          ? "Update schema"
                          : "Generate schema"}
                </Button>
            </div>
        </div>
    );
}
