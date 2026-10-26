import { describe, expect, layer } from '@effect/vitest';
import { Effect } from 'effect';
import { cli, MockConsole, TestLive } from 'test/__utils__';

describe('CLI: composio orgs list', () => {
  layer(
    TestLive({
      // Stores `org_1` as the current global org.
      fixture: 'user-config-with-global-context',
      accountData: {
        // Newest first, as the API lists them.
        organizations: [
          { id: 'org_1', name: 'acme', created_at: '2026-09-14T08:30:00.000Z' },
          { id: 'org_2', name: 'personal_workspace', created_at: '2025-03-02T17:05:41.123Z' },
        ],
      },
    })
  )(it => {
    it.effect('[Then] prints each organization with its created_at as JSON on stdout', () =>
      Effect.gen(function* () {
        yield* cli(['orgs', 'list']);

        const stdout = yield* MockConsole.getLines({ stream: 'stdout' });
        expect(stdout.map(line => JSON.parse(line) as unknown)).toEqual([
          [
            {
              id: 'org_1',
              name: 'acme',
              created_at: '2026-09-14T08:30:00.000Z',
              is_selected_global_org: true,
            },
            {
              id: 'org_2',
              name: 'personal_workspace',
              created_at: '2025-03-02T17:05:41.123Z',
              is_selected_global_org: false,
            },
          ],
        ]);

        const stderr = yield* MockConsole.getLines({ stripAnsi: true, stream: 'stderr' });
        expect(stderr).toContain('✓ acme (org_1)\n  personal_workspace (org_2)');
      })
    );
  });
});
