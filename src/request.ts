import axios, { type AxiosRequestConfig } from "axios";
import { assignRecursive } from "./utils";
import type { E621 } from "./client";

export async function request(url: string, method: "get" | "post" | "patch", client: E621, body?: FormData) {
    return await axios[method](url, body, assignRecursive(client.axiosConfig ?? {}, {
        headers: {
            Authorization: client.authorization
        }
    }));
}