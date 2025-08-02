import { MutuallyExclusive } from "../utils";

export type Updater<P extends string> = MutuallyExclusive<
    { [K in P]: string; },
    { [K in P as `${K}_diff`]: string; }
>;

export type TagStringUpdater = Updater<"tag_string">;
export type SourceUpdater = Updater<"source">;
export type LockState = `is_${"rating" | "note" | "comment" | "status"}_locked`;