import { AxiosRequestConfig } from "axios";
import { useApi, query } from "./parser";
import { Post } from "./structs";
import { assignRecursive } from "./utils";
import { SearchConfig } from "./structs/config";
import { AccountInfo } from "./structs/auth";
import { request } from "./request";
import { ValidIdField } from "./structs/value";

export class E621 {
    public axiosConfig: AxiosRequestConfig = {};
    public accountInfo: AccountInfo | null = null;

    public get authorization() {
        return "Basic" + btoa(`${this.accountInfo?.username}:${this.accountInfo?.apikey}`);
    }

    public configureAxios(config: Partial<AxiosRequestConfig>) {
        this.axiosConfig = assignRecursive(this.axiosConfig, config);
    }

    public async login(username: string, apikey: string) {
        this.accountInfo = { username, apikey };
    }

    public async searchPost(config: Partial<SearchConfig> = {}): Promise<Post[]> {
        const response = await request(useApi("posts") + query(config), "get", this);
        return response.data.posts;
    }
    public async fetchPost(id: ValidIdField) {
        const response = await request(useApi(`posts/${id}`), "get", this);
        return response.data.post;
    }
}