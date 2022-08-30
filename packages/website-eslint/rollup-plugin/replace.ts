import type { Plugin, TransformResult } from 'rollup';
import rollupPluginUtils from '@rollup/pluginutils';
import MagicString from 'magic-string';

function createMatcher(
  it: RegExp | Array<RegExp> | undefined,
): (id: unknown) => boolean {
  return rollupPluginUtils.createFilter(it);
}

export function replacePlugin(
  replacesRaw: Array<{
    match?: RegExp;
    test: RegExp;
    replace: string;
  }>,
): Plugin {
  const replaces = (replacesRaw ?? []).map(item => {
    return {
      match: item.match,
      test: item.test,
      replace: item.replace,
      matcher: createMatcher(item.match),
    };
  });

  return {
    name: 'rollup-plugin-replace',
    /**
     * @param {string} code
     * @param {string} id
     */
    transform(code, id): TransformResult {
      let hasReplacements = false;
      const magicString = new MagicString(code);

      replaces.forEach(item => {
        if (item.matcher && !item.matcher(id)) {
          return;
        }

        let match = item.test.exec(code);
        let start, end;
        while (match) {
          hasReplacements = true;
          start = match.index;
          end = start + match[0].length;
          magicString.overwrite(start, end, item.replace);
          match = item.test.global ? item.test.exec(code) : null;
        }
      });

      if (!hasReplacements) {
        return;
      }
      return { code: magicString.toString() };
    },
  };
}
