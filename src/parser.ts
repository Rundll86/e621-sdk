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
export function fromSearchTag(tag: string | SearchTag) {
    return (typeof tag === "string" ? tag : toSearchTag(tag)).split("+").map(name => decodeURIComponent(name).replaceAll("_", " "));
}
export function query(data: Record<string, string | number | undefined>) {
    return `?${Object.keys(data).map(key => data[key] === undefined ? undefined : `${key}=${data[key]}`).filter(x => x !== undefined).join("&")}`;
}