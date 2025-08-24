# Changelog

All notable changes to **"Eddy"-LLM Workbench** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## \[0.1.0] - 2025-08-23

### Added

* Initial public release.
* Six providers live: **Groq, Mistral, OpenAI, Google, LM Studio, Anthropic**.
* Tile-based UI with provider icons, active highlight, and latency display.
* Side-by-side comparison of multiple providers.
* Local session logging to JSONL.
* Export sessions to JSONL and Markdown.
* Config file at `~/.config/llm-workbench/config.yml` (0600 permissions).
* Containerized release (multi-arch: amd64/arm64) published to GHCR.
* README with quickstart, demo, and icons.
* CONTRIBUTING guidelines and issue templates.

---

## \[Unreleased]

### Planned

* Add Ollama provider.
* Fedora COPR / RPM packaging (systemd service).
* Flatpak packaging for Linux desktop.
* Preset Compare pairs (Groq vs Anthropic, OpenAI vs Mistral).
