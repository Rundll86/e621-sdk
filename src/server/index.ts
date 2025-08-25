import express, { Request, Response } from "express";
import { E621 } from "../client";
import path from "path";
import cors from "cors";
import { toSearchTag } from "../parser";

const app = express();
const port = process.env.PORT || 3000;
const client = new E621({
    log: true
});

client.configureAxios({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
    }
});

app.use(cors());

app.get("/api/search", async (req: Request, res: Response) => {
    try {
        const { tags, limit, page } = req.query;
        const posts = await client.searchPost({
            tags: toSearchTag(tags as string),
            limit: limit ? parseInt(limit as string) : undefined,
            page: page ? parseInt(page as string) : undefined
        });
        res.json(posts.map(post => post.data));
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});
app.get("/api/post/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const post = await client.fetchPost(id);
        res.json(post.data);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});
app.get("/api/random", async (req: Request, res: Response) => {
    try {
        const tags = req.query.tags as string;
        const post = await client.randomPost(...tags.split(" "));
        res.json(post.data);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});
app.get("/api/static/:md5/:ext", async (req: Request, res: Response) => {
    try {
        const { md5, ext } = req.params;
        const data = await client.static(md5, ext);
        res.setHeader("Content-Type", `image/${ext}`);
        res.send(data);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});
app.get("/api/status", async (_, res) => {
    try {
        const { status, message } = await client.serverStatus();
        res.json({ status, message });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

app.get("/", (_, res) => {
    res.sendFile(path.resolve("public/index.html"));
});
app.get("/wallpaper", (_, res) => {
    res.sendFile(path.resolve("public/wallpaper.html"));
});
app.get("/favicon.ico", (_, res) => {
    res.sendFile(path.resolve("public/favicon.ico"));
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});