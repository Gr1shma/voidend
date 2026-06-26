import { api } from "~/trpc/react";

export function useProjects() {
    return api.project.getAll.useQuery();
}

export function useCreateProject() {
    const utils = api.useUtils();
    return api.project.create.useMutation({
        onSuccess: () => {
            void utils.project.getAll.invalidate();
        },
    });
}

export function useUpdateProject() {
    const utils = api.useUtils();
    return api.project.update.useMutation({
        onSuccess: () => {
            void utils.project.getAll.invalidate();
        },
    });
}

export function useDeleteProject() {
    const utils = api.useUtils();
    return api.project.delete.useMutation({
        onSuccess: () => {
            void utils.project.getAll.invalidate();
        },
    });
}
