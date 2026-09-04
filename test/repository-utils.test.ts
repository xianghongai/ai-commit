import assert from 'node:assert/strict';
import { test } from 'vitest';
import { isPathInside, selectRepositoryByPath } from '@/repository-utils';

test('does not treat sibling paths with the same prefix as nested repositories', () => {
  assert.equal(isPathInside('/work/app', '/work/app-backup'), false);
});

test('selects the deepest matching repository for nested repositories', () => {
  const selected = selectRepositoryByPath(
    [
      { rootPath: '/work', value: 'parent' },
      { rootPath: '/work/app', value: 'child' },
    ],
    '/work/app/src/file.ts'
  );
  assert.equal(selected, 'child');
});
