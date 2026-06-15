import fs from "fs";
import os from "os";
import path from "path";
import { resolveSchema } from "./schema-resolver";

function getDataDir(): string {
    switch (process.platform) {
        case "linux":
            return path.join(
                process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local/share"),
                "ghostend",
            );
        case "darwin":
            return path.join(os.homedir(), "Library/Application Support/ghostend");
        case "win32":
            return path.join(process.env.APPDATA || os.homedir(), "ghostend");
        default:
            return path.join(os.homedir(), ".ghostend");
    }
}

function getEndpointFilePath(projectId: string, endpointId: string): string {
    const dir = path.join(getDataDir(), projectId);
    fs.mkdirSync(dir, { recursive: true });
    return path.join(dir, `${endpointId}.json`);
}

export function getData(projectId: string, endpointId: string): unknown | null {
    const filePath = getEndpointFilePath(projectId, endpointId);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as unknown;
}

export function generateAndSaveData(
    projectId: string,
    endpointId: string,
    schema: unknown,
    count: number,
): unknown {
    const filePath = getEndpointFilePath(projectId, endpointId);
    const data =
        count > 1
            ? Array.from({ length: count }, () => resolveSchema(schema))
            : resolveSchema(schema);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return data;
}

export function invalidateEndpointData(projectId: string, endpointId: string): void {
    const filePath = getEndpointFilePath(projectId, endpointId);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function deleteProjectData(projectId: string): void {
    const dir = path.join(getDataDir(), projectId);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
