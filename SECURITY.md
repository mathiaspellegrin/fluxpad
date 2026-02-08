# Security

## Responsible disclosure

Found something sketchy? Please don’t drop it in a public issue.

Reach out to the maintainers in private (Discord: mathiaspel works) with a clear description and how to reproduce it. Give us a bit of time to fix it before you go public—we’ll do the same for you. We really do appreciate people who help keep FluxPad (and its users) out of trouble.

## Security notes

- **Secrets.** This thing uses API keys, bot tokens, and wallet private keys. Never commit `.env`, and never put real creds in the repo. Use [.env.example](.env.example) as a template; `.env` is already in `.gitignore` for a reason.
- **Keys and tokens.** For dev, use testnet keys and tokens with the minimum permissions you need. If something might’ve leaked, rotate it. No exceptions.
- **Bots and relayers.** The Discord and Telegram bots run on whatever tokens you give them—so give them as little as they need. The main server and xLeoBot use wallet keys for on-chain stuff (voting, NFT creation). Use throwaway test wallets, not your main stack.
- **Contracts.** There are owner and agent roles. In production, lock down who can do admin stuff.

More on what each env var does: [docs/config.md](docs/config.md).

## Dependencies and Dependabot

Dependabot alerts are worth fixing, but **risk depends on how you use the code**. For this repo:

| Alert | Severity | In this project |
|-------|----------|-----------------|
| **axios** (SSRF/credential leak, DoS) | High / Critical | You only use axios in `fetchcandles.js` for GETs to a fixed GeckoTerminal URL (no user-controlled URLs), so SSRF exposure is low. DoS and credential-leak fixes are still important. |
| **form-data** (unsafe random boundary) | Critical | Transitive (via axios). Only matters if you send multipart bodies; `fetchcandles` only does GET. Fix by upgrading deps. |
| **qs** (arrayLimit bypass → DoS) | High | Used by Express for query parsing. A crafted request with huge `?a[]=1&a[]=1&...` could exhaust memory. **Worth fixing.** |
| **tough-cookie** (prototype pollution) | Moderate | Transitive (via axios). Low impact if you don’t rely on cookie parsing for security. |
| **lodash** (prototype pollution in `_.unset`/`_.omit`) | Moderate | Transitive (e.g. discord.js / request-promise-core). Depends on whether user input flows into lodash; moderate. |
| **undici** (random values, decompression DoS, cert DoS) | Moderate / Low | Transitive (discord.js). Affects Discord bot HTTP stack; upgrade discord.js when possible. |
| **request** (SSRF, deprecated) | Moderate | Transitive (e.g. node-telegram-bot-api). Deprecated; reducing or replacing that dependency is good long term. |

**What to do:**

1. **Upgrade axios** to **1.8.2+** (fixes SSRF/credential leak and improves DoS handling):
   ```bash
   npm install axios@^1.8.2
   ```
2. **Update lockfile** so transitive deps get patched where possible:
   ```bash
   npm update
   ```
3. **Pin or override transitive fixes** if Dependabot still reports vulnerable versions:
   - **qs** → 6.14.1 or higher (Express’s dependency may need an override).
   - **form-data** → 4.0.4 or higher (axios may pull this in; if not, add an `overrides` in `package.json`).
4. **Optional:** In `fetchcandles.js`, you could replace axios with Node’s built-in `fetch` (Node 18+) so you depend on one fewer HTTP library; that reduces the surface for axios/form-data/qs/tough-cookie in that script.
5. **Merge Dependabot PRs** when they bump these packages (or apply equivalent version bumps yourself).

So: the alerts are real and worth addressing, but for *this* project the scariest ones are **axios** (upgrade to 1.8.2+) and **qs** (DoS on your Express server). The rest are either transitive, lower severity, or only matter in code paths you don’t use heavily.
