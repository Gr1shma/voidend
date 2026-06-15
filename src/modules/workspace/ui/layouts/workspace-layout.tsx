"use client";

import { Sidebar } from "../components/sidebar/workspace-sidebar";
import { Button } from "~/components/ui/button";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { EndpointBar } from "../components/dashboard/endpointBar";

export function ApiClientLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-full w-full flex border">
      <div
        className={cn(
          "h-full shrink-0 overflow-hidden border-r transition-all duration-300",
          isCollapsed ? "w-0 border-r-0" : "w-64",
        )}
      >
        <div className="h-full w-64">
          <Sidebar />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col bg-background">
        <div className="flex items-center gap-2 border-b p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => setIsCollapsed((v) => !v)}
            aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpenIcon className="h-4 w-4" />
            ) : (
              <PanelLeftCloseIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <EndpointBar />
      </div>
    </div>
  );
}
