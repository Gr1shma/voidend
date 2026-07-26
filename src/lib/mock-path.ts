export function cleanSegment(segment: string) {
    return segment.replace(/^\/+|\/+$/g, "");
}

export function joinPath(...segments: Array<string | undefined | null>) {
    const path = segments
        .map((segment) => cleanSegment(segment ?? ""))
        .filter(Boolean)
        .join("/");
    return path ? `/${path}` : "/";
}

/** Normalize project basePath for prefix stripping (e.g. `/api/v1`). Empty when `/`. */
export function normalizeBasePath(basePath: string | undefined | null): string {
    if (!basePath || basePath === "/") return "";
    const cleaned = cleanSegment(basePath);
    return cleaned ? `/${cleaned}` : "";
}

export function stripBasePath(incomingPath: string, basePath: string | undefined | null): string {
    const normalized = normalizeBasePath(basePath);
    if (!normalized) return incomingPath;
    if (incomingPath === normalized) return "/";
    if (incomingPath.startsWith(normalized + "/")) {
        return incomingPath.slice(normalized.length);
    }
    return incomingPath;
}

export function matchPath(pattern: string, incoming: string): boolean {
    const regex = new RegExp("^" + pattern.replace(/:[^/]+/g, "[^/]+") + "$");
    return regex.test(incoming);
}

/** Mock route path segment after `/mock/{projectId}`, basePath + endpoint.path only. */
export function buildMockPath(basePath: string | undefined | null, endpointPath: string): string {
    return joinPath(basePath, endpointPath);
}

export function buildMockUrl(
    origin: string,
    projectId: string,
    basePath: string | undefined | null,
    endpointPath: string,
): string {
    return `${origin}/mock/${projectId}${buildMockPath(basePath, endpointPath)}`;
}

export function getMockOrigin(): string {
    if (typeof window !== "undefined") return window.location.origin;
    return `http://localhost:${process.env.PORT ?? 3000}`;
}
