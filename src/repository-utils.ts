import * as path from 'path';

export interface RepositoryPathEntry<T> {
  rootPath: string;
  value: T;
}

/**
 * 按路径边界选择最深层仓库。
 * 该规则同时支持精确根路径与嵌套资源，不使用会误匹配同名前缀的 startsWith。
 */
export function selectRepositoryByPath<T>(entries: RepositoryPathEntry<T>[], resourcePath: string): T | undefined {
  const normalizedResourcePath = path.resolve(resourcePath);
  return entries
    .filter(({ rootPath }) => isPathInside(path.resolve(rootPath), normalizedResourcePath))
    .sort((left, right) => right.rootPath.length - left.rootPath.length)[0]?.value;
}

/** 判断 resourcePath 是否等于 rootPath 或位于其真实路径边界内。 */
export function isPathInside(rootPath: string, resourcePath: string): boolean {
  const relative = path.relative(rootPath, resourcePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}
