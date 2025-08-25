const path = require("path");

const { optimize: { LimitChunkCountPlugin } } = require("webpack");
const Webpackbar = require("webpackbar");

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
    entry: "./src/lib.ts",
    output: {
        path: path.resolve(__dirname, "dist/lib"),
        filename: "e621-sdk.js",
    },
    module: {
        rules: [
            {
                test: /\.ts$/i,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
        fallback: {
            url: false
        }
    },
    plugins: [
        new LimitChunkCountPlugin({ maxChunks: 1 }),
        new Webpackbar({
            name: "e621-sdk",
            color: "green"
        })
    ]
};