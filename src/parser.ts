import { SearchTag } from "./structs";

export const baseUrl = "https://e621.net";
export function useApi(url: string) {
    return `${baseUrl}/${url}.json`;
}
export function toSearchTag(...names: string[] | SearchTag[]): string {
    return names
        .flatMap(name => typeof name === "string" ? [name] : Object.values(name).flat())
        .map(name => encodeURIComponent(name.toLowerCase().replaceAll(" ", "_")))
        .join("+");
}
export function query(data: Record<string, any>) {
    return `?${Object.keys(data).map(key => `${key}=${data[key]}`).join("&")}`
}