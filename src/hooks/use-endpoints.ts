import { api } from "~/trpc/react";
import { toast } from "sonner";

function invalidateEndpointQueries(utils: ReturnType<typeof api.useUtils>) {
    void utils.endpoint.getByProject.invalidate();
    void utils.endpoint.getById.invalidate();
}

export function useEndpoints(projectId: string | null | undefined) {
    return api.endpoint.getByProject.useQuery(
        { projectId: projectId ?? "" },
        { enabled: !!projectId },
    );
}

export function useEndpointById(endpointId: string | null | undefined) {
    return api.endpoint.getById.useQuery({ id: endpointId ?? "" }, { enabled: !!endpointId });
}

export function useCreateEndpoint() {
    const utils = api.useUtils();
    return api.endpoint.create.useMutation({
        onSuccess: () => {
            invalidateEndpointQueries(utils);
            toast.success("Endpoint created");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create endpoint");
        },
    });
}

export function useUpdateEndpoint() {
    const utils = api.useUtils();
    return api.endpoint.update.useMutation({
        onSuccess: () => {
            invalidateEndpointQueries(utils);
            toast.success("Endpoint updated");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update endpoint");
        },
    });
}

export function useDeleteEndpoint() {
    const utils = api.useUtils();
    return api.endpoint.delete.useMutation({
        onSuccess: () => {
            invalidateEndpointQueries(utils);
            toast.success("Endpoint deleted");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete endpoint");
        },
    });
}
