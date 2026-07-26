import { useState } from "react";
import { toast } from "sonner";
import {
    useCreateProject,
    useDeleteProject,
    useImportProject,
    useProjects,
    useUpdateProject,
} from "~/hooks/use-projects";
import { useCreateFolder, useDeleteFolder, useRenameFolder } from "~/hooks/use-folders";
import { useCreateEndpoint, useDeleteEndpoint, useUpdateEndpoint } from "~/hooks/use-endpoints";
import { api } from "~/trpc/react";
import type { ModalTarget } from "./types";

export function useSidebarActions() {
    const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalTarget | null>(null);
    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
    } | null>(null);

    const createFolder = useCreateFolder();
    const deleteFolder = useDeleteFolder();
    const updateFolder = useRenameFolder();
    const createProject = useCreateProject();
    const deleteProject = useDeleteProject();
    const updateProject = useUpdateProject();
    const importProject = useImportProject();
    const createEndpoint = useCreateEndpoint();
    const deleteEndpoint = useDeleteEndpoint();
    const updateEndpoint = useUpdateEndpoint();
    const trpcUtils = api.useUtils();

    const confirmDangerousAction = (title: string, description: string, onConfirm: () => void) => {
        setConfirmState({ open: true, title, description, onConfirm });
    };

    const handleExportProject = async (projectId: string) => {
        try {
            const data = await trpcUtils.project.exportProject.fetch({ id: projectId });
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${data.project.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-export.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Project exported");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to export project");
        }
    };

    return {
        projects,
        isLoadingProjects,
        renamingId,
        setRenamingId,
        modal,
        setModal,
        confirmState,
        setConfirmState,
        confirmDangerousAction,
        handleExportProject,
        createFolder,
        deleteFolder,
        updateFolder,
        createProject,
        deleteProject,
        updateProject,
        importProject,
        createEndpoint,
        deleteEndpoint,
        updateEndpoint,
    };
}
