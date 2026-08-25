# oscout organization profile

This repository owns the public GitHub profile and shared base assets for the
[`oscout`](https://github.com/oscout) organization.

- `profile/README.md` renders on the organization home page.
- `profile/assets/org-hero.svg` is the profile README hero.
- `assets/oscout-avatar.svg` is the source for the organization avatar.
- `assets/org-social-preview.svg` is the source for repository and social cards.
- `assets/brand-tokens.json` records the small shared palette.
- `ORG_METADATA.md` records the recommended GitHub organization fields.

Generate upload-ready PNGs and verify the profile with:

```bash
bun install
bun run assets:render
bun run check
```

Keep claims aligned with Scout's current posture: high-trust local developer
pilots, not enterprise or compliance readiness.
