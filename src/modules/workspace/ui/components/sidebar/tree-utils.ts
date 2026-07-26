export function commitRename<T extends string>(
    currentName: string,
    nextName: string,
    onRename: (name: T) => void,
    onFinish: () => void,
) {
    const normalizedName = nextName.trim() || currentName;

    if (normalizedName !== currentName) {
        onRename(normalizedName as T);
    }

    onFinish();
}
