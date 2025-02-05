import { build } from 'esbuild';
import { commonOptions } from '../../../.scripts/common-build.js';

async function main() {
  const entry = ['src/index.ts'];
  const external = [/^lit/];
  const debug = process.argv.includes('--debug');

  /** @param {Partial<Parameters<typeof commonOptions>[0]>} args */
  const shared = (args = {}) => commonOptions({ entry, external, ...args });

  await Promise.all([
    build({
      ...shared({ dev: true }),
      bundle: true,
      outdir: 'dist/dev',
    }),
    build({
      ...shared(),
      bundle: true,
      outdir: 'dist/prod',
    }),
    build({
      ...shared({ node: true, entry: ['src/node.ts'], external: [] }),
      bundle: true,
      // minify: !debug,
      outfile: 'dist/node/index.js',
    }),
  ]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
