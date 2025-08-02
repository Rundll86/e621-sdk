import axios, { AxiosRequestConfig } from "axios";
import { useApi, query } from "./parser";
import { Post } from "./structs";
import { assignRecursive } from "./utils";
import { SearchConfig } from "./structs/config";

export class E621 {
    private config: AxiosRequestConfig = {};
    public configureAxios(config: Partial<AxiosRequestConfig>) {
        this.config = assignRecursive(this.config, config);
    }
    public async search(config: Partial<SearchConfig> = {}): Promise<Post[]> {
        const response = await axios.get(useApi("posts") + query(config), this.config);
        return response.data.posts;
    }
}