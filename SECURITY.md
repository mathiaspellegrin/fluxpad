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
