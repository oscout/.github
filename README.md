# oscout organization profile

This repository owns the public GitHub profile and shared base assets for the
[`oscout`](https://github.com/oscout) organization.

- `profile/README.md` renders on the organization home page.
- `assets/illustrations/` contains the shared light/dark integration artwork and PNG exports.
- [`illustrations/`](./illustrations/README.md) owns the generator, platform icons, gallery, captions, and visual rules.
- `profile/assets/org-hero.png` retains the homepage artwork used for social cards (1730×909).
- `assets/oscout-avatar.svg` is the canonical app icon source for the organization avatar; `assets/oscout-avatar.png` is ready to upload.
- `assets/org-social-preview.png` is an unchanged copy of the approved homepage artwork for repository and social cards.
- `assets/brand-tokens.json` records the small shared palette.
- `assets/brand/` holds the canonical Scout lockup and glyph (ink and light) copied from the Scout brand kit. Integration READMEs carry local copies of the lockup in `assets/`.
- `assets/pages/scout-pages.css` is the shared stylesheet for integration GitHub Pages. Each `docs/assets/` keeps a byte-identical copy with the light lockup and glyph favicons; edit here, then copy.
- `ORG_METADATA.md` records the recommended GitHub organization fields.

Generate upload-ready PNGs and verify the profile with:

```bash
bun install
bun run assets:render
bun run illustrations:render
bun run check
```

Keep claims aligned with Scout's current posture: high-trust local developer
pilots, not enterprise or compliance readiness.
