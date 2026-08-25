import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "README.md",
  "profile/README.md",
  "profile/assets/org-hero.svg",
  "profile/assets/org-hero.png",
  "assets/oscout-avatar.svg",
  "assets/oscout-avatar.png",
  "assets/org-social-preview.svg",
  "assets/org-social-preview.png",
  "assets/brand-tokens.json",
];

const missing = required.filter((path) => !existsSync(resolve(root, path)));
if (missing.length > 0) {
  throw new Error(`Missing organization profile assets:\n${missing.map((path) => `  - ${path}`).join("\n")}`);
}

const profile = readFileSync(resolve(root, "profile/README.md"), "utf8");
for (const link of profile.matchAll(/(?:src|href)="((?:\.\.?\/)[^"#]+)(?:#[^"]+)?"/g)) {
  if (!existsSync(resolve(root, "profile", link[1]))) {
    throw new Error(`Broken profile asset link: ${link[1]}`);
  }
}

if (/enterprise-ready|compliance-ready/i.test(profile)) {
  throw new Error("Organization profile must not claim enterprise or compliance readiness");
}

console.log(`organization profile check passed (${required.length} required surfaces)`);
