export type ModalTarget =
    | { kind: "project"; projectId?: never; parentId?: never; folderId?: never }
    | { kind: "folder"; projectId: string; parentId?: string }
    | { kind: "endpoint"; projectId: string; folderId?: string };

export type SidebarProject = {
    id: string;
    title: string;
};
