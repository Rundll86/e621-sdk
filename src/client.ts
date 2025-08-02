import { AxiosRequestConfig } from "axios";
import { useApi, query, toSearchTag } from "./parser";
import { Post } from "./structs";
import { assignRecursive, count } from "./utils";
import { SearchConfig } from "./structs/config";
import { AccountInfo } from "./structs/auth";
import { request } from "./request";
import { ValidIdField } from "./structs/value";

export class E621Authenticator {
    public axiosConfig: AxiosRequestConfig = {};
    public configureAxios(config: Partial<AxiosRequestConfig>) {
        this.axiosConfig = assignRecursive(this.axiosConfig, config);
    }

    public accountInfo: AccountInfo | null = null;
    public get isAuthorized() {
        return this.accountInfo != null;
    }
    public get authorizationCode() {
        return this.isAuthorized ? "Basic " + btoa(`${this.accountInfo?.username}:${this.accountInfo?.apikey}`) : undefined;
    }
    public async login(username: string, apikey: string) {
        this.accountInfo = { username, apikey };
    }
}
export class E621 extends E621Authenticator {
    rateLimiter: RateLimiter | null = null;
    log: boolean = false;

    public async searchPost(config: Partial<SearchConfig> = {}): Promise<Post[]> {
        const response = await request(useApi("posts") + query(config), "get", this);
        return response.data.posts;
    }
    public async fetchPost(id: ValidIdField): Promise<Post> {
        const response = await request(useApi(`posts/${id}`), "get", this);
        return response.data.post;
    }
    public async randomPost(...tags: string[]): Promise<Post> {
        const response = await request(useApi("posts/random") + query({ tags: toSearchTag(...tags) }), "get", this);
        return response.data.post;
    }
}
/**
 * @description 限制请求速率
 */
export class RateLimiter {
    public intervalPerRequest: number = count(1).per(1000); //每1秒1次请求
    public lastRequest: number = 0;
    public get time() {
        return Date.now();
    }
    public get rest() {
        return this.intervalPerRequest - (this.time - this.lastRequest);
    }
    public get ready() {
        return this.time - this.lastRequest >= this.intervalPerRequest
    }
    public start() {
        if (this.ready) {
            this.lastRequest = this.time;
            return true;
        } else return false;
    }
    public async wait(): Promise<number> {
        return new Promise(resolve => {
            const { rest } = this;
            setTimeout(async () => {
                if (!this.ready) resolve(await this.wait() + rest);
                else resolve(rest);
            }, rest + 1);
        });
    }
}