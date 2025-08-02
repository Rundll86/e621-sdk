import { AxiosRequestConfig } from "axios";
import { useApi, query, toSearchTag } from "./parser";
import { Post, rateColorMap, rateNameMap } from "./structs";
import { assignRecursive, count } from "./utils";
import { SearchConfig } from "./structs/config";
import { AccountInfo } from "./structs/auth";
import { request } from "./request";
import { ValidIdField } from "./structs/value";
import chalkTemplate from "chalk-template";

export class E621Authenticator {
    axiosConfig: AxiosRequestConfig = {};
    configureAxios(config: Partial<AxiosRequestConfig>) {
        this.axiosConfig = assignRecursive(this.axiosConfig, config);
    }

    accountInfo: AccountInfo | null = null;
    get isAuthorized() {
        return this.accountInfo != null;
    }
    get authorizationCode() {
        return this.isAuthorized ? "Basic " + btoa(`${this.accountInfo?.username}:${this.accountInfo?.apikey}`) : undefined;
    }
    async login(username: string, apikey: string) {
        this.accountInfo = { username, apikey };
    }
}
export class E621 extends E621Authenticator {
    rateLimiter: RateLimiter | null = null;
    log: boolean = false;
    constructor(config?: { rateLimiter?: RateLimiter, log?: boolean }) {
        super();
        Object.assign(this, config ?? {});
    }
    async searchPost(config: Partial<SearchConfig> = {}): Promise<PostWrapper[]> {
        const response = await request(useApi("posts") + query(config), "get", this);
        return response.data.posts.map((post: Post) => new PostWrapper(post, this));
    }
    async fetchPost(id: ValidIdField): Promise<PostWrapper> {
        const response = await request(useApi(`posts/${id}`), "get", this);
        return new PostWrapper(response.data.post, this);
    }
    async randomPost(...tags: string[]): Promise<PostWrapper> {
        const response = await request(useApi("posts/random") + query({ tags: toSearchTag(...tags.filter(Boolean)) }), "get", this);
        return new PostWrapper(response.data.post, this);
    }
    async static(md5: string, ext: string): Promise<ArrayBuffer> {
        this.axiosConfig.responseType = "arraybuffer";
        const response = await request(`https://static1.e621.net/data/${md5.slice(0, 2)}/${md5.slice(2, 4)}/${md5}.${ext}`, "get", this);
        delete this.axiosConfig.responseType;
        return response.data;
    }
}
/**
 * @description 限制请求速率
 */
export class RateLimiter {
    intervalPerRequest: number = count(1).per(1000); //每1秒1次请求
    lastRequest: number = 0;
    get time() {
        return Date.now();
    }
    get rest() {
        return this.intervalPerRequest - (this.time - this.lastRequest);
    }
    get ready() {
        return this.time - this.lastRequest >= this.intervalPerRequest
    }
    start() {
        if (this.ready) {
            this.lastRequest = this.time;
            return true;
        } else return false;
    }
    async wait(): Promise<number> {
        return new Promise(resolve => {
            const { rest } = this;
            setTimeout(async () => {
                if (!this.ready) resolve(await this.wait() + rest);
                else resolve(rest);
            }, rest + 1);
        });
    }
}
export class PostWrapper {
    data: Post | null = null;
    parentClient: E621 | null = null;

    constructor(data: Post, client: E621) {
        this.data = data;
        this.parentClient = client;
    }

    get formatted() {
        if (!this.data) return null;
        const { score, file, id } = this.data;
        const { up, down } = score;
        const { width, height, url } = file;
        const rateText = rateColorMap[this.data.rating](`${rateNameMap[this.data.rating].slice(0, 4)}`);
        return chalkTemplate`${rateText} {bold #${id}} {italic 👍${up} 👎${Math.abs(down)}} [{cyan ${width}}*{cyan ${height}}] {bold.underline ${url}}`;
    }
}