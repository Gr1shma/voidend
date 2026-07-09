import { api } from "~/trpc/react";
import { toast } from "sonner";

function invalidateProjectQueries(utils: ReturnType<typeof api.useUtils>) {
    void utils.project.getAll.invalidate();
    void utils.project.getById.invalidate();
}

export function useProjects() {
    return api.project.getAll.useQuery();
}

export function useProjectById(projectId: string | null | undefined) {
    return api.project.getById.useQuery({ id: projectId ?? "" }, { enabled: !!projectId });
}

export function useCreateProject() {
    const utils = api.useUtils();
    return api.project.create.useMutation({
        onSuccess: () => {
            invalidateProjectQueries(utils);
            toast.success("Project created");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create project");
        },
    });
}

export function useUpdateProject() {
    const utils = api.useUtils();
    return api.project.update.useMutation({
        onSuccess: () => {
            invalidateProjectQueries(utils);
            toast.success("Project updated");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update project");
        },
    });
}

export function useDeleteProject() {
    const utils = api.useUtils();
    return api.project.delete.useMutation({
        onSuccess: () => {
            invalidateProjectQueries(utils);
            toast.success("Project deleted");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete project");
        },
    });
}
