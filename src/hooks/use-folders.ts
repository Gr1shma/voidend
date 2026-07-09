import { api } from "~/trpc/react";
import { toast } from "sonner";

function invalidateFolderQueries(utils: ReturnType<typeof api.useUtils>) {
    void utils.folder.getByProject.invalidate();
}

export function useFolders(projectId: string | null | undefined) {
    return api.folder.getByProject.useQuery(
        { projectId: projectId ?? "" },
        { enabled: !!projectId },
    );
}

export function useCreateFolder() {
    const utils = api.useUtils();
    return api.folder.create.useMutation({
        onSuccess: () => {
            invalidateFolderQueries(utils);
            toast.success("Folder created");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create folder");
        },
    });
}

export function useRenameFolder() {
    const utils = api.useUtils();
    return api.folder.update.useMutation({
        onSuccess: () => {
            invalidateFolderQueries(utils);
            toast.success("Folder updated");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update folder");
        },
    });
}

export function useDeleteFolder() {
    const utils = api.useUtils();
    return api.folder.delete.useMutation({
        onSuccess: () => {
            invalidateFolderQueries(utils);
            toast.success("Folder deleted");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete folder");
        },
    });
}
