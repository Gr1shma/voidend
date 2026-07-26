import { faker } from "@faker-js/faker";

export function stringToSeed(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

export function resolveSchema(schema: unknown): unknown {
    if (typeof schema === "string" && schema.startsWith("$faker.")) {
        const path = schema.slice(7).split(".");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fn: any = faker;
        for (const key of path) fn = fn?.[key];
        return typeof fn === "function" ? fn() : null;
    }

    if (Array.isArray(schema)) {
        return schema.map(resolveSchema);
    }

    if (typeof schema === "object" && schema !== null && "$array" in schema) {
        const s = schema as { $array: unknown; $count?: number };
        return Array.from({ length: s.$count ?? 3 }, () => resolveSchema(s.$array));
    }

    if (typeof schema === "object" && schema !== null) {
        return Object.fromEntries(Object.entries(schema).map(([k, v]) => [k, resolveSchema(v)]));
    }

    return schema;
}

export function resolveResponseData(
    schema: unknown,
    count: number,
    seed: string | number = "voidend",
): unknown {
    if (typeof seed === "string") {
        faker.seed(stringToSeed(seed));
    } else {
        faker.seed(seed);
    }

    return count > 1
        ? Array.from({ length: count }, () => resolveSchema(schema))
        : resolveSchema(schema);
}
