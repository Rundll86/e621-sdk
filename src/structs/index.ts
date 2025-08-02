export interface Post {
    id: string;
    created_at: Date;
    updated_at: Date;
    file: FileStore;
    preview: PictureMeta[];
    score: {
        up: number;
        down: number;
        total: number;
    };
    tags: Record<'general' | 'species' | 'character' | 'artist' | 'invalid' | 'lore' | 'meta', string[]>;
    locked_tags: string[];
    change_seq: string;
    flags: StateFlag[];
    rating: "s" | "q" | "e";
    fav_count: number;
    sources: string[];
    pools: string[];
    relationships: Relationship[];
    approver_id: string;
    uploader_id: string;
    description: string;
    comment_count: string;
    is_favorited: boolean;
}
export interface PictureMeta {
    width: number;
    height: number;
    url: string;
}
export interface FileStore extends PictureMeta {
    ext: string;
    size: number;
    md5: string;
}
export interface SampleStore extends PictureMeta {
    has: boolean;
}
export interface StateFlag {
    pending: boolean;
    flagged: boolean;
    note_locked: boolean;
    status_locked: boolean;
    rating_locked: boolean;
    deleted: boolean;
}
export interface Relationship {
    parent_id: string;
    has_children: boolean;
    hsa_active_children: boolean;
    children: string[];
}