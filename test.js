const { E621, parser } = require(".");
const client = new E621();
client.configureAxios({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
    }
});
client.fetchPost(5750034).then(e => {
    console.log(e);
});
