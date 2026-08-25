import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jobs = [
  ["assets/oscout-avatar.svg", "assets/oscout-avatar.png"],
  ["assets/org-social-preview.svg", "assets/org-social-preview.png"],
  ["profile/assets/org-hero.svg", "profile/assets/org-hero.png"],
];

for (const [source, output] of jobs) {
  await sharp(join(root, source), { density: 144 })
    .png({ compressionLevel: 9 })
    .toFile(join(root, output));
  console.log(`rendered ${output}`);
}
