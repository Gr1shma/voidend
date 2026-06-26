import { api } from "~/trpc/react";

export function useFolders(projectId: string) {
  return api.folder.getByProject.useQuery(
    { projectId },
    { enabled: !!projectId },
  );
}

export function useCreateFolder() {
  const utils = api.useUtils();
  return api.folder.create.useMutation({
    onSuccess: () => {
      void utils.folder.getByProject.invalidate();
    },
  });
}

export function useRenameFolder() {
  const utils = api.useUtils();
  return api.folder.update.useMutation({
    onSuccess: () => {
      void utils.folder.getByProject.invalidate();
    },
  });
}

export function useDeleteFolder() {
  const utils = api.useUtils();
  return api.folder.delete.useMutation({
    onSuccess: () => {
      void utils.folder.getByProject.invalidate();
    },
  });
}
