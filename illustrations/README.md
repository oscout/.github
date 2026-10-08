# Scout integration illustrations

A shared family of thin, platform-specific documentation illustrations. The Scout mark anchors a restrained green connection; each host keeps its own recognizable structure and icon. These are conceptual drawings, not screenshots.

## Generate

From the organization repository root:

```bash
bun install --frozen-lockfile
bun run illustrations:render
bun run check
```

`render.mjs` reads the source icons in `marks/` and writes `assets/illustrations/{host}-scout-{dark,light}.svg`, `.png`, and `@2x.png`. SVG and standard PNG canvases are 1600 × 500; double-resolution PNGs are 3200 × 1000. `manifest.json` owns captions, alt text, and destination repositories. [View the gallery](./index.html).

## Use in an integration

Copy the host's light and dark SVGs into the integration repository's `assets/` directory as `scout-illustration-light.svg` and `scout-illustration-dark.svg`. Use a `<picture>` with a `prefers-color-scheme: dark` source and a light fallback, followed by the manifest caption. Copy the provenance note too; Hermes also retains the MIT license. For a GitHub Pages site published from `/docs`, keep its illustration under `docs/assets/` so Pages can serve it.

## Visual rules

- Keep the canonical Scout glyph and platform icon geometry intact.
- Preserve the 1600 × 500 composition and thin 2/3/4px stroke hierarchy.
- Use the dark graphite/ivory or light ivory/ink palette; green identifies the Scout connection.
- Preserve the quiet/body/strong ink hierarchy; avoid decorative frames or additional connection lines.
- Identify platforms with the established marks in [the source notes](./marks/SOURCES.md).
- Keep explanations in selectable text and accessible descriptions, outside the artwork.

| Host | Structure |
| --- | --- |
| Scout | Central broker with four distinct host miniatures. |
| Claude Code | Running transcript and a framed prompt. |
| Codex | Review task card beside a code diff. |
| Cursor | Selected code carried into an agent pane. |
| Herdr | Uneven terminal splits with one active pane. |
| pi | Sparse prompt and extension slots. |
| Hermes | Conversation, tool bridge, and tool slots. |
| Grok Bot | Local bridge, hosted boundary, and conversation card. |
| Android | Encrypted relay, then a handset with a heads-up permission request. |
