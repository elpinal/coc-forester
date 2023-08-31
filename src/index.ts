import {
  CancellationToken,
  CompleteOption,
  CompleteResult,
  ExtensionContext,
  SourceConfig,
  sources,
  window,
} from 'coc.nvim';
import Process from 'node:child_process';
import { promisify } from 'node:util';

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

async function getCompletionItems(opt: CompleteOption, _token: CancellationToken): Promise<CompleteResult> {
  const line = opt.line.substring(0, opt.col);
  const closingBracketIndex = line.lastIndexOf('](');
  if (closingBracketIndex < 0) {
    return {
      items: [],
    };
  }
  let title = line.substring(closingBracketIndex + 2);

  if (title == "") {
    const openingBracketIndex = line.substring(0, closingBracketIndex).lastIndexOf('[');
    if (openingBracketIndex < 0) {
      return {
        items: [],
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
        filterText: s.substring(j + 2),
      };
    }),
  };
}
