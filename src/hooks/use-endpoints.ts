import { api } from "~/trpc/react";

export function useEndpoints(projectId: string) {
  return api.endpoint.getByProject.useQuery(
    { projectId },
    { enabled: !!projectId },
  );
}

export function useCreateEndpoint() {
  const utils = api.useUtils();
  return api.endpoint.create.useMutation({
    onSuccess: () => {
      // Invalidate all endpoint queries globally (works for any project)
      void utils.endpoint.getByProject.invalidate();
    },
  });
}

export function useUpdateEndpoint() {
  const utils = api.useUtils();
  return api.endpoint.update.useMutation({
    onSuccess: () => {
      // Invalidate all endpoint queries globally (works for any project)
      void utils.endpoint.getByProject.invalidate();
    },
  });
}

export function useDeleteEndpoint() {
  const utils = api.useUtils();
  return api.endpoint.delete.useMutation({
    onSuccess: () => {
      // Invalidate all endpoint queries globally (works for any project)
      void utils.endpoint.getByProject.invalidate();
    },
  });
}
