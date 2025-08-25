import { AxiosRequestConfig } from "axios";
import { useApi, query, toSearchTag, baseUrl } from "./parser";
import { Post, rateColorMap, rateNameMap } from "./structs";
import { assignRecursive, count } from "./utils";
import { SearchConfig } from "./structs/config";
import { AccountInfo } from "./structs/auth";
import { request } from "./request";
import { ValidIdField } from "./structs/value";
import chalkTemplate from "chalk-template";
import { URL } from "url";

export class E621Authenticator {
    //镜像Url
    imageUrls: Record<string, string> = {};
    useImage: false | string = false;
    //Axios
    axiosConfig: AxiosRequestConfig = {};
    configureAxios(config: Partial<AxiosRequestConfig>) {
        this.axiosConfig = assignRecursive(this.axiosConfig, config);
    }
    //鉴权
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
    //镜像增删改查
    delImage(name: string) {
        delete this.imageUrls[name];
    }
    addImage(name: string, url: string, autoUse: boolean = false) {
        this.imageUrls[name] = url;
        if (autoUse) {
            this.use(name);
        }
    }
    use(name: string | false) {
        this.useImage = name;
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
        const response = await request(useApi("posts", this) + query(config), "get", this);
        if (this.useImage) return response.data.map((post: Post) => new PostWrapper(post, this));
        else return response.data.posts.map((post: Post) => new PostWrapper(post, this));
    }
    async fetchPost(id: ValidIdField): Promise<PostWrapper> {
        const response = await request(useApi(`posts/${id}`, this), "get", this);
        if (this.useImage) return new PostWrapper(response.data, this);
        else return new PostWrapper(response.data.post, this);
    }
    async randomPost(...tags: string[]): Promise<PostWrapper> {
        const tag = tags[Math.floor(Math.random() * tags.length)];
        const response = await request(useApi("posts/random", this) + query({ tags: toSearchTag(tag) }), "get", this);
        if (this.useImage) return new PostWrapper(response.data, this);
        else return new PostWrapper(response.data.post, this);
    }
    async static(md5: string, ext: string, progressCallback?: (event: { loaded: number; total: number; percent: number }) => void): Promise<ArrayBuffer> {
        this.axiosConfig.responseType = "arraybuffer";
        if (progressCallback) {
            this.axiosConfig.onDownloadProgress = e => {
                progressCallback({
                    loaded: e.loaded,
                    total: e.total ?? 0,
                    percent: e.loaded / (e.total ?? 0),
                });
            };
        }
        const response = await request(
            this.useImage
                ? new URL(`/api/static/${md5}/${ext}`, this.imageUrls[this.useImage]).toString()
                : `https://static1.e621.net/data/${md5.slice(0, 2)}/${md5.slice(2, 4)}/${md5}.${ext}`,
            "get",
            this
        );
        if (progressCallback) {
            delete this.axiosConfig.onDownloadProgress;
        }
        delete this.axiosConfig.responseType;
        return response.data;
    }
    async serverStatus(): Promise<{
        status: boolean;
        message: unknown | null;
    }> {
        try {
            await request(this.useImage ? this.imageUrls[this.useImage] : baseUrl, "get", this);
            return {
                status: true,
                message: null,
            };
        } catch (e) {
            return {
                status: false,
                message: e,
            };
        }
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