import React from "react";
import { Info } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

export function FieldLabel({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
    return (
        <div className="flex items-center gap-1.5">
            <Label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                {children}
            </Label>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <span className="inline-flex cursor-pointer text-muted-foreground/60 hover:text-primary transition-colors">
                            <Info className="h-3 w-3" />
                        </span>
                    }
                />
                <TooltipContent side="top" className="max-w-56 text-xs">
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}
