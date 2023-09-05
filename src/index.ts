import {
  CancellationToken,
  CompleteOption,
  CompleteResult,
  ExtensionContext,
  SourceConfig,
  sources,
  window,
  workspace,
} from 'coc.nvim';
import Process from 'node:child_process';
import { promisify, TextDecoder, TextEncoder } from 'node:util';
import Path from 'path';

const exec = promisify(Process.exec);

export async function activate(context: ExtensionContext): Promise<void> {
  window.showMessage(`coc-forester works!`);

  const srcConf: SourceConfig = {
    name: 'coc-forester completion source', // unique id
    doComplete: async (opt, token) => {
      const items = await getCompletionItems(opt, token);
      return items;
    },
  }

  context.subscriptions.push(
    sources.createSource(srcConf),
  );
}

async function getcwd(): Promise<string> {
  let vim = workspace.nvim;
  let tabpage = await vim.tabpage;
  let tabpagenr = await tabpage.number;
  return vim.call('getcwd', [-1, tabpagenr]);
}

async function getCompletionItems(opt: CompleteOption, _token: CancellationToken): Promise<CompleteResult> {
  let encoder = new TextEncoder();
  let whole = encoder.encode(opt.line);
  const prefix = whole.slice(0, opt.colnr - 1);
  const line = new TextDecoder().decode(prefix);
  // console.error(`line: ${line}`);
  // console.error(`col: ${opt.col}`);
  // console.error(`colnr: ${opt.colnr}`);
  const closingBracketIndex = line.lastIndexOf('](');
  // console.error(`closingBracketIndex: ${closingBracketIndex}`);
  if (closingBracketIndex < 0) {
    return {
      items: [],
    };
  }
  let title = line.substring(closingBracketIndex + 2);
  // console.error(`title: ${title}`);

  let cwd = await getcwd();
  let inputDir = Path.join(cwd, 'trees');

  const { stdout } = await exec(`forester complete --title=${title} ${inputDir}`);

  let i = encoder.encode(line.substring(0, closingBracketIndex)).byteLength;

  return {
    startcol: i + 2,
    items: stdout.split("\n").map((s) => {
      const j = s.indexOf(",");
      return {
        word: s.substring(0, j),
        menu: s.substring(j + 2),
        filterText: s.substring(j + 2),
      };
    }),
  };
}
