"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";

export function InlineRename({
    defaultValue,
    onConfirm,
    onCancel,
}: {
    defaultValue: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}) {
    const [value, setValue] = useState(defaultValue);

    return (
        <Input
            autoFocus
            value={value}
            className="h-6 flex-1 px-1.5 py-0 text-sm"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") onConfirm(value.trim() || defaultValue);
                if (event.key === "Escape") onCancel();
            }}
            onBlur={() => onConfirm(value.trim() || defaultValue)}
            onClick={(event) => event.stopPropagation()}
        />
    );
}
