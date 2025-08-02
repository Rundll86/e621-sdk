#!/usr/bin/env node
import { program } from "commander";
import packages from "../../package.json";
import { E621 } from "../client";
import { toSearchTag } from "../parser";

const client = new E621();
client.configureAxios({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
    }
});

program
    .name(packages.name)
    .description(packages.description)
    .version(packages.version);


program.command("search")
    .description("搜索帖子")
    .option("-t, --tags <tags>", "标签")
    .option("-l, --limit <limit>", "限制")
    .option("-p, --page <page>", "页码")
    .action(async (options) => {
        try {
            const posts = await client.searchPost({
                tags: toSearchTag(...options.tags?.split(",") ?? []),
                limit: options.limit,
                page: options.page,
            });
            posts.forEach((post) => {
                console.log(post.formatted);
            });
        } catch (err) {
            console.error("Failed to connect E621:", (err as Error).message);
        }
    });

program.command("fetch <id>")
    .description("获取指定帖子")
    .action(async (id) => {
        try {
            const post = await client.fetchPost(id);
            console.log(post.formatted);
        } catch (err) {
            console.error("Failed to connect E621:", (err as Error).message);
        }
    });

program.command("random")
    .description("随机获取帖子")
    .option("-t, --tags <tags>", "标签")
    .action(async (options) => {
        try {
            const post = await client.randomPost(...options.tags?.split(",") ?? [])
            console.log(post.formatted);
        } catch (err) {
            console.error("Failed to connect E621:", (err as Error).message);
        }
    });

program.parse(process.argv);
