<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/oscout/.github/main/assets/illustrations/scout-scout-dark.svg" />
    <img src="https://raw.githubusercontent.com/oscout/.github/main/assets/illustrations/scout-scout-light.svg" alt="Scout connects Claude Code, Codex, Cursor, and hosted conversations through a local broker." width="100%" />
  </picture>
</p>

<p align="center">
  <strong>Open infrastructure for your personal agent cloud.</strong><br />
  A local control plane and mesh network across the machines you own.
</p>

<p align="center">
  <a href="https://github.com/oscout/scout"><img alt="Scout" src="https://img.shields.io/badge/explore-Scout-fff7ea?style=flat-square&labelColor=171a16" /></a>
  <a href="https://www.npmjs.com/package/@openscout/scout"><img alt="npm version" src="https://img.shields.io/npm/v/@openscout/scout?style=flat-square&label=npm&color=f7f4ea&labelColor=171a16" /></a>
  <a href="https://oscout.net"><img alt="oscout.net" src="https://img.shields.io/badge/home-oscout.net-dde6d8?style=flat-square&labelColor=171a16" /></a>
</p>

---

We build the public core of **OpenScout**: a local-first control plane for
discovering coding-agent sessions, routing work, and keeping coordination
durable across tools and machines.

> **Local control plane + mesh network = your personal agent cloud.**

## Start with Scout

[`oscout/scout`](https://github.com/oscout/scout) is the CLI, broker, runtime,
protocol, and local web surface behind the OpenScout agent mesh.

```bash
bun add -g @openscout/scout

scout setup
scout doctor
scout ask --project . --harness codex "Review this repository."
```

## Choose your integration

| Your tool | Scout integration |
| --- | --- |
| Claude Code | [Commands and channel](https://github.com/oscout/claude-scout) |
| Codex | [MCP tools and coordination skill](https://github.com/oscout/codex-scout) |
| Cursor | [Editor MCP configuration](https://github.com/oscout/cursor-scout) |
| Herdr | [Terminal pane actions and feed](https://github.com/oscout/herdr-scout) |
| pi | [Native Scout tools](https://github.com/oscout/pi-scout) |
| Hermes | [Conversation and tool bridge](https://github.com/oscout/hermes-scout) |
| Grok Bot | [Hosted connector](https://github.com/oscout/grok-scout) |

## What guides the work

| Principle | In practice |
| --- | --- |
| **Local first** | Your broker and coordination state stay under your control. |
| **Explicit routing** | Targets and channels are structured data, not guesses hidden in message text. |
| **Durable coordination** | Requests, flights, replies, and handoffs survive individual sessions. |
| **Observed transcripts** | External harness history remains source material, not silently imported first-party chat. |
| **Honest mesh semantics** | Mesh means reachability and coordination—not global consensus or exactly-once delivery. |

OpenScout is currently built for high-trust local developer pilots. We are
shipping the foundations in public while the product is still young, and we
avoid claiming enterprise or compliance readiness before it exists.

## Find your way in

- [Install Scout](https://github.com/oscout/scout#get-started)
- [Read the architecture](https://github.com/oscout/scout#the-small-model)
- [Contribute](https://github.com/oscout/scout/blob/main/CONTRIBUTING.md)
- [Get support](https://github.com/oscout/scout/blob/main/SUPPORT.md)
- [Report a security issue](https://github.com/oscout/scout/security/policy)

<p align="center"><sub>Built for operators who want agents to collaborate without surrendering the controls.</sub></p>
