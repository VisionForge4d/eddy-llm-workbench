# Security Policy

## Supported Versions

Only the latest tagged release of **"Eddy"-LLM Workbench** is actively supported with security fixes.

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not open a public issue.**
Instead, report it responsibly by emailing:

**[VisionForge4d@protonmail.com]**

We will acknowledge receipt within 48 hours and aim to provide a fix within a reasonable timeframe depending on severity.

## Security Model

* **Local-first by default**: the server binds to `127.0.0.1` unless configured otherwise.
* **Zero telemetry**: no analytics, metrics, or external logging.
* **BYO keys**: API keys are stored only in the user’s config file (`~/.config/llm-workbench/config.yml`), never transmitted anywhere except directly to the configured provider.
* **Permissions**: config files should be created with `0600` permissions, config directory with `0700`.
* **No secrets in logs**: prompts and keys are never logged.
* **Rate limiting**: built-in guardrails (60 RPM per provider) to mitigate abuse and accidental floods.

## Best Practices for Users

* Always run the container with host mapping restricted to localhost:

  ```bash
  -p 127.0.0.1:8080:8080
  ```
* Mount config directories with correct permissions:

  ```bash
  chmod 700 ~/.config/llm-workbench
  chmod 600 ~/.config/llm-workbench/config.yml
  ```
* Rotate API keys periodically.
* Avoid running the Workbench bound to public interfaces.

## Disclosure Policy

* Coordinated disclosure is preferred: please give us time to investigate and patch before making vulnerabilities public.
* All fixes will be documented in the [CHANGELOG](CHANGELOG.md).

---

Thank you for helping keep **LLM Workbench** secure and safe for everyone.
