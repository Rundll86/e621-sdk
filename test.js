const { E621, RateLimiter, parser, structs } = require(".");

const client = new E621({
    rateLimiter: new RateLimiter(),
    log: true
});
client.configureAxios({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
    }
});

client.randomPost("Von Lycaon", "Death (puss in boots)");
client.fetchPost(114514);
client.searchPost({
    tags: parser.toSearchTag("Von Lycaon", "Death (puss in boots)"),
    limit: 10,
    page: 1
});