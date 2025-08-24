# Contributing to "Eddy"-LLM Workbench

First off, thanks for taking the time to contribute! This project is meant as a **clean, local-first FOSS tool**, and contributions from the community will help it grow.

---

## Ways to Contribute

* **Report bugs**: open an issue with steps to reproduce.
* **Suggest features**: open a feature request issue; keep scope small and aligned with project ethos (local-first, lightweight).
* **Improve docs**: README, examples, or tutorials.
* **Add providers**: implement a new LLM provider adapter.
* **Polish UI/UX**: better visuals, accessibility, or exports.

---

## Pull Request Process

1. Fork the repo and create a branch: `feature/add-provider-x`.
2. Keep PRs small and focused.
3. Add/update tests for your changes.
4. Run linter and unit tests before submitting.
5. Ensure the README and docs are updated if needed.
6. Submit PR → we’ll review, discuss, and merge if aligned.

---

## Provider Adapter Guide

Each provider adapter implements the `Provider` interface:

```ts
export type ChatParams = { temperature?: number; max_tokens?: number };
export type ChatResult = { output: string; usage?: any; model: string; latency_ms: number };

export interface Provider {
  name: string;
  isConfigured(): boolean;                 // key/url present?
  chat(system: string | undefined, prompt: string, params: ChatParams): Promise<ChatResult>;
}
```

**Steps to add a provider:**

1. Create `apps/server/src/router/<provider>.ts`.
2. Implement `Provider` interface (use API client or fetch).
3. Add env/config keys in `config.yml`.
4. Register provider in `registry` in `providers.ts`.
5. Update README to list new provider.

---

## Code Style

* TypeScript for backend and frontend.
* React + Vite for UI.
* Use `prettier` and `eslint` defaults.
* Keep code small, composable, and easy to review.

---

## Tests

* Unit tests: provider adapters, config loader, API routes.
* Integration: run container, check `/health`, `/api/run` for each provider.
* Add tests with `vitest` or `jest`.

---

## Community Standards

* Be respectful and constructive.
* No spam or unrelated features.
* Keep the ethos: **local-first, simple, zero telemetry.**

---

## License

By contributing, you agree your work will be licensed under the MIT License of this project.
