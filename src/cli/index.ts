#!/usr/bin/env node
import { program } from "commander";
import packages from "../../package.json";
import { E621 } from "../client";
import { formatArrayBuffer, toSearchTag, truncate } from "../parser";
import fs from "fs";
import chalkTemplate from "chalk-template";
import { progressBar } from "../utils";

const client = new E621();
client.configureAxios({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
    }
});

program.hook("preAction", () => {
    const opts = program.opts();
    client.log = opts.debug;
    if (opts.image) {
        client.addImage("cli", opts.image, true);
    }
});

program
    .option("-d, --debug", "是否开启调试模式")
    .option("-i, --image <image>", "镜像URL");
program
    .name(packages.name)
    .description(packages.description)
    .version(packages.version);

program.command("search <tags>")
    .description("搜索帖子")
    .option("-l, --limit <limit>", "限制")
    .option("-p, --page <page>", "页码")
    .action(async (tags, options) => {
        try {
            const posts = await client.searchPost({
                tags: toSearchTag(...tags?.split(",") ?? []),
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
program.command("static <md5> <ext>")
    .description("获取静态资源")
    .requiredOption("-o, --output <output>", "输出路径")
    .action(async (md5, ext, options) => {
        try {
            const data = await client.static(md5, ext, e => {
                process.stdout.write(progressBar(e.percent) + "\r");
            });
            console.log("");
            fs.writeFileSync(options.output, Buffer.from(data));
            console.log(chalkTemplate`${formatArrayBuffer(data, `${truncate(md5, 4)}${ext}`)} : {italic ${options.output}}`);
        } catch (err) {
            console.error("Failed to connect E621:", (err as Error).message);
        }
    });
program.command("status")
    .description("获取服务器状态")
    .action(async () => {
        const { status, message } = await client.serverStatus();
        console.log(chalkTemplate`E621服务器状态：{bold.${status ? "green" : "red"} ${status ? "在线" : "离线"}}`);
        if (message) {
            console.log(chalkTemplate`{bold.yellow ${message}}`);
        }
    });

program.parse(process.argv);
