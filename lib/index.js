"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  activate: () => activate
});
module.exports = __toCommonJS(src_exports);
var import_coc = require("coc.nvim");
var import_node_child_process = __toESM(require("node:child_process"));
var import_node_util = require("node:util");
var exec = (0, import_node_util.promisify)(import_node_child_process.default.exec);
async function activate(context) {
  import_coc.window.showMessage(`coc-forester works!`);
  const srcConf = {
    name: "coc-forester completion source",
    // unique id
    doComplete: async (opt, token) => {
      const items = await getCompletionItems(opt, token);
      return items;
    }
  };
  context.subscriptions.push(
    import_coc.sources.createSource(srcConf)
  );
}
async function getCompletionItems(opt, _token) {
  const line = opt.line.substring(0, opt.col);
  const closingBracketIndex = line.lastIndexOf("](");
  if (closingBracketIndex < 0) {
    return {
      items: []
    };
  }
  let title = line.substring(closingBracketIndex + 2);
  if (title == "") {
    const openingBracketIndex = line.substring(0, closingBracketIndex).lastIndexOf("[");
    if (openingBracketIndex < 0) {
      return {
        items: []
      };
    }
    title = line.substring(openingBracketIndex + 1, closingBracketIndex);
  }
  const { stdout } = await exec(`forester complete --title=${title} trees`);
  return {
    startcol: closingBracketIndex + 2,
    items: stdout.split("\n").map((s) => {
      const j = s.indexOf(",");
      return {
        word: s.substring(0, j),
        menu: s.substring(j + 2),
        filterText: s.substring(j + 2)
      };
    })
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate
});
