import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { copyFile } from "node:fs/promises";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// The approved homepage artwork is the master; retain its original pixels.
await copyFile(join(root, "profile/assets/org-hero.png"), join(root, "assets/org-social-preview.png"));
await sharp(join(root, "assets/oscout-avatar.svg"))
  .png({ compressionLevel: 9 })
  .toFile(join(root, "assets/oscout-avatar.png"));
console.log("Prepared Scout avatar and approved social artwork");
