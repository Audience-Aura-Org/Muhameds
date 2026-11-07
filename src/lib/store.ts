import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Minimal JSON-file persistence for orders, contact messages and pending reviews.
 * Works on any Node host with a writable disk (VPS, Docker, Hostinger Node app).
 * On serverless hosts (e.g. Vercel) the disk is ephemeral: swap this module for a
 * database-backed implementation with the same three functions.
 */
const DIR = process.env.DATA_DIR || path.join(process.cwd(), 'var');
const locks = new Map<string, Promise<unknown>>();

async function readAll<T>(name: string): Promise<T[]> {
  try {
    return JSON.parse(await fs.readFile(path.join(DIR, `${name}.json`), 'utf8')) as T[];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
}

/** Serialises writes per collection so concurrent requests can't clobber each other. */
async function withLock<R>(name: string, fn: () => Promise<R>): Promise<R> {
  const prev = locks.get(name) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  locks.set(name, run.catch(() => undefined));
  return run;
}

export async function append<T>(name: string, record: T): Promise<void> {
  await withLock(name, async () => {
    await fs.mkdir(DIR, { recursive: true });
    const all = await readAll<T>(name);
    all.push(record);
    const file = path.join(DIR, `${name}.json`);
    await fs.writeFile(file + '.tmp', JSON.stringify(all, null, 1));
    await fs.rename(file + '.tmp', file); // atomic replace
  });
}

export async function find<T>(name: string, pred: (r: T) => boolean): Promise<T | undefined> {
  return (await readAll<T>(name)).find(pred);
}

export async function some<T>(name: string, pred: (r: T) => boolean): Promise<boolean> {
  return (await readAll<T>(name)).some(pred);
}
