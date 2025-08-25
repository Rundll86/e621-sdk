import * as E621SDK from ".";

Object.defineProperty(window, "e621", {
    value: E621SDK,
    writable: false,
    enumerable: true,
    configurable: true,
});