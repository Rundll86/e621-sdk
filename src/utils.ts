import chalkTemplate from "chalk-template";

export function assignRecursive<T extends object>(target: T, ...sources: Partial<T>[]): T {
    const result = Object(target);
    for (const nextSource of sources) {
        if (nextSource != null) {
            for (const nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    const nextVal = nextSource[nextKey];
                    if (typeof nextVal === "object" && nextVal !== null && !Array.isArray(nextVal)) {
                        result[nextKey] = assignRecursive(Object.prototype.hasOwnProperty.call(result, nextKey) ? result[nextKey] : {}, nextVal);
                    } else {
                        result[nextKey] = nextVal;
                    }
                }
            }
        }
    }
    return result;
}
export function createForm(data: Record<string, string | number | undefined>) {
    const result = new FormData();
    Object.keys(data).forEach(key => result.append(key, String(data[key])));
    return result;
}
export function count(c: number) {
    return {
        per(t: number) {
            return t / c;
        }
    }
}
export function progressBar(percent: number, length: number = 10) {
    const filled = Math.floor(percent * length);
    return chalkTemplate`<{bold ${"#".repeat(filled)}}${".".repeat(length - filled)} {bold.yellow ${(percent * 100).toFixed(2)}%}>`;
}
export type BanKey<T, U extends string | symbol | number> = {
    [K in keyof T as K extends keyof U ? never : K]: T[K];
}
export type MutuallyExclusive<T, U> =
    | (T & { [K in keyof U]?: never })
    | (U & { [K in keyof T]?: never });
export type ValueOf<T> = T[keyof T];