import axios from "axios";
import { assignRecursive } from "./utils";
import type { E621 } from "./client";

export async function request(url: string, method: "get" | "post" | "patch", client: E621, body?: FormData) {
    const config = assignRecursive(client.axiosConfig ?? {}, client.isAuthorized ? {
        headers: {
            Authorization: client.authorizationCode
        }
    } : {});
    if (client.log) {
        console.log(`${method.toUpperCase()}ING ${url} with`, config);
    }
    if (method === "get") {
        return axios.get(url, config);
    } else {
        return axios[method](url, body, config);
    }
}