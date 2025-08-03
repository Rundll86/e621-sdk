import chalkTemplate from "chalk-template";
import { E621 } from "./client";
import { SearchTag } from "./structs";
import { URL } from "url";
export const baseUrl = "https://e621.net";

export function useApi(url: string, client: E621) {
    if (client.useImage) {
        if (url === "posts") {
            return new URL("/api/search", client.imageUrls[client.useImage]).toString();
        } else if (url === "posts/random") {
            return new URL("/api/random", client.imageUrls[client.useImage]).toString();
        } else {
            return new URL(`/api/${url.replaceAll("posts", "post")}`, client.imageUrls[client.useImage]).toString();
        }
    } else return `${baseUrl}/${url}.json`;
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
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength) + "...";
}
export function formatArrayBuffer(ab: ArrayBuffer, fn: string): string {
    return chalkTemplate`[{bold ${fn}}] {cyan ${(ab.byteLength / 1024).toFixed(1)}kb}`;
}