import type { Plugin, ResolveIdResult } from 'rollup';
import path from 'path';
import Module from 'module';
import rollupPluginUtils from '@rollup/pluginutils';

function toAbsolute(id: string): string {
  return id.startsWith('./') ? path.resolve(id) : require.resolve(id);
}

function createMatcher(it: RegExp | Array<RegExp>): (id: unknown) => boolean {
  return rollupPluginUtils.createFilter(it);
}

export function aliasPlugin(
  aliasesRaw: Array<{
    match: RegExp | Array<RegExp>;
    target: string;
  }>,
): Plugin {
  const aliasesCache = new Map<string, string>();
  const aliases = (aliasesRaw ?? []).map(item => {
    return {
      match: item.match,
      matcher: createMatcher(item.match),
      target: item.target,
      absoluteTarget: toAbsolute(item.target),
    };
  });

  return {
    name: 'rollup-plugin-alias',
    resolveId(id, importerPath): ResolveIdResult {
      const importeePath =
        importerPath != null && (id.startsWith('./') || id.startsWith('../'))
          ? Module.createRequire(importerPath).resolve(id)
          : id;

      const cachedResult: string | undefined = aliasesCache.get(importeePath);
      if (cachedResult) {
        return cachedResult;
      }

      const result = aliases.find(item => item.matcher(importeePath));
      if (result) {
        aliasesCache.set(importeePath, result.absoluteTarget);
        return result.absoluteTarget;
      }

      return null;
    },
  };
}
