import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Invoked through npm so the same npm executable works on Windows and CI.
const npmCli = process.env.npm_execpath;
if (!npmCli) {
  throw new Error('Run this check through npm --prefix app run contract:check.');
}

const source = fileURLToPath(new URL('./openapi.yaml', import.meta.url));
const generated = fileURLToPath(new URL('./generated/schema.d.ts', import.meta.url));
const app = fileURLToPath(new URL('../app/', import.meta.url));
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'spmis-contract-'));

try {
  const expectedPath = join(temporaryDirectory, 'schema.d.ts');
  const result = spawnSync(process.execPath, [
    npmCli, 'exec', '--yes', '--package=openapi-typescript@7.13.0', '--',
    'openapi-typescript', source, '--default-non-nullable=false', '-o', expectedPath,
  ], { cwd: app, stdio: 'inherit' });

  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('Contract type generation failed.');

  const normalize = text => text.replaceAll('\r\n', '\n');
  const [committed, expected] = await Promise.all([
    readFile(generated, 'utf8'),
    readFile(expectedPath, 'utf8'),
  ]);

  if (normalize(committed) !== normalize(expected)) {
    throw new Error('Generated types are stale. Run npm --prefix app run contract:gen.');
  }

  console.log('Contract lint and generated-type freshness passed.');
  console.log('Live PostgREST drift is NOT checked: migrations/backend do not exist yet.');
} finally {
  // This is solely the unique temporary directory created above.
  await rm(temporaryDirectory, { recursive: true, force: true });
}
