# FluxPad

Conflux gets a lot easier when you’re not clicking through every mint, vote, and chart yourself. FluxPad is a multi-agent setup that handles tokens, NFTs, voting, and market stuff—so you don’t have to.

## Why it exists

Nobody wants to babysit the chain. You’ve got assets to mint, proposals to vote on, and markets that move while you’re asleep. FluxPad hands that off to a handful of AI agents that actually talk to your contracts and APIs—no duct tape required. One codebase drives the web app’s API, the Discord and Telegram and X bots, and whatever you’re doing on-chain.

## What it does

- **API backend** — Express server. Chat endpoints for Erza, Mathias, Aria, and Debra. Your frontend hits this.
- **Smart contracts** — FluxPadFactory (tokens/NFTs) and ProjectVoting, both on Conflux eSpace testnet.
- **Agents** — Erza points people around the ecosystem. Mathias votes. Aria mints. Debra digs into markets. Leo handles the X/Twitter side.
- **Bots** — Debra shows up on Discord and Telegram; Leo runs separately for X. Each is its own process.
- **Market data** — `fetchcandles.js` grabs OHLCV from GeckoTerminal and dumps it into `project_candles/` so Debra has something to work with.

## Architecture (high-level)

- **index.js** — The Express API. Frontend and clients talk to it when they want to chat with an agent.
- **handlers.js** — Where the agents actually do things (OpenAI + Conflux). Pulls from `characters/`, `knowledge/`, `projects.json`.
- **Bots** — discordDebraBot.js, telegramDebraBot.js, xLeoBot.js. Separate processes—they don’t live inside the main server.
- **fetchcandles.js** — Keeps candle data flowing for Debra.

```
Frontend  →  index.js  ↔  handlers.js  ↔  Conflux / OpenAI
Bots and fetchcandles run as separate processes.
```

More detail (and a proper diagram) lives in [docs/architecture.md](docs/architecture.md).

## Quickstart

**You’ll need:** Node.js (LTS is the safe bet).

1. Clone, then get your env in place:
   ```bash
   git clone https://github.com/mathiaspellegrin/fluxpad
   cd fluxpad
   cp .env.example .env
   npm install
   ```
2. Crack open `.env` and drop in at least `OPENAI_API_KEY`—plus whatever else you need for the flows you care about. Full list’s in [docs/config.md](docs/config.md).
3. Fire up the API:
   ```bash
   npm run dev
   ```
4. Want candles, Discord, or Telegram? Those are separate. See [docs/running.md](docs/running.md).
5. Poke the agents from the terminal: `npm run test`.

**Something broke?** [docs/troubleshooting.md](docs/troubleshooting.md) has the usual suspects.

## Config

Env vars cover: API keys (OpenAI, xAI), server `PORT`, Discord/Telegram tokens and channel IDs, X API creds, each agent’s wallet key (testnet only), and contract addresses. The full list—with short descriptions—is in [docs/config.md](docs/config.md).

## Deployment

Nothing written down yet. When we do, it’ll live in [docs/deployment.md](docs/deployment.md).

## Security notes

Put every secret in `.env`—API keys, bot tokens, wallet keys. Don’t commit that file. Ever. Stick to testnet keys and tokens with the least permissions you can get away with. For how we handle vulns and more detail, see [SECURITY.md](SECURITY.md).

## Proof / Demo

- **Live:** [https://fluxpad.org/](https://fluxpad.org/)
- **Demo video:** [https://youtu.be/zMIFPvWzAqU](https://youtu.be/zMIFPvWzAqU)
- **Diagram:** [Excalidraw](https://excalidraw.com/#json=Nlokfw5MS6ragTlJ8GDp5,y-LhldPRmeIIKRjXBTGhoQ)

How to run it yourself: [docs/demo.md](docs/demo.md).

## Status

**Prototype** (or bump this to Hackathon / Bounty submission / Production when it fits).

- **What’s in place:** API and all four chat agents (Erza, Mathias, Aria, Debra), Discord/Telegram/X bots, the two Conflux contracts (Factory + Voting), and the candle pipeline.
- **What’s next:** [docs/roadmap.md](docs/roadmap.md).

## Contributing

We take PRs. The drill’s in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE).

## Contact

- Discord: mathiaspel | [FluxPad Community](https://discord.gg/5ZhArVUzUT)
- Website: [mbp-enterprises.com](https://mbp-enterprises.com)
