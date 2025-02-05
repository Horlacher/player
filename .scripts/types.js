import { execa } from 'execa';
import chokidar from 'chokidar';
import minimist from 'minimist';
import { readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';

const __cwd = process.cwd();

const args = minimist(process.argv.slice(2));

const pkgPath = path.resolve(__cwd, 'package.json');
const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'));

const tsConfigFile = fs.existsSync('tsconfig.build.json') ? 'tsconfig.build.json' : 'tsconfig.json';

async function main() {
  try {
    if (pkg.scripts['pre:types']) {
      await execa('pnpm', ['run', 'pre:types'], { stdio: 'inherit' });
    }

    await execa('tsc', ['-p', tsConfigFile, '--pretty'], { stdio: 'inherit' });

    if (pkg.scripts['pre:types:extract']) {
      await execa('pnpm', ['run', 'pre:types:extract'], { stdio: 'inherit' });
    }

    await execa('api-extractor', ['run', '-c', 'types.json'], { stdio: 'inherit' });

    if (pkg.scripts['post:types:extract']) {
      await execa('pnpm', ['run', 'post:types:extract'], { stdio: 'inherit' });
    }

    await execa('rimraf', ['dist/**/*.d.ts'], { stdio: 'inherit' });

    if (pkg.scripts['post:types']) {
      await execa('pnpm', ['run', 'post:types'], { stdio: 'inherit' });
    }
  } catch (e) {
    console.error(e);
  }
}

let running = false;
const onChange = async () => {
  if (running) return;
  running = true;
  await main();
  running = false;
};

onChange();

if (args.w) {
  chokidar
    .watch(['src/**/*.ts', 'src/**/*.tsx', ...(args.glob?.split(',') ?? [])])
    .on('add', onChange)
    .on('change', onChange)
    .on('unlink', onChange);
}
