// Runs `next build` / `next start` with NODE_ENV forced to "production".
// Some hosts (e.g. Hostinger) inject NODE_ENV=development from their env panel,
// which makes Next.js bundle React's development build and fail to prerender
// /404 with "<Html> should not be imported outside of pages/_document".
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (process.env.NODE_ENV && process.env.NODE_ENV !== "production") {
  console.warn(`[next.mjs] Overriding NODE_ENV="${process.env.NODE_ENV}" with "production".`);
}

const result = spawnSync("next", args, {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NODE_ENV: "production" },
});

process.exit(result.status ?? 1);
