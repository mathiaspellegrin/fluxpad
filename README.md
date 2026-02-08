# FluxPad

Multi-agent platform on Conflux for tokens, NFTs, voting, and market data and on-chain actions, without manual intervention.

**🏆 2nd place – Conflux Hackathon**

This repo is the **initial (hackathon) version** of FluxPad. The frontend and product have evolved since; a significant part of the current codebase is private and will be open-sourced later.

## Why it exists

Assets to mint, proposals to vote on, markets to track. FluxPad delegates these to specialized AI agents that interact with smart contracts and external APIs. One codebase drives the web app’s API, the Discord and Telegram and X bots, and whatever you’re doing on-chain.

## Core components

- **API backend** — Express server with chat endpoints for Erza, Mathias, Aria, and Debra. Frontend talks to this.
- **Smart contracts** — This repo ships hackathon-era testnet contracts (FluxPadFactory, ProjectVoting). Full contract suite, mainnet addresses, and integration details: [Fluxpad/contracts](https://github.com/Fluxpad/contracts).
- **Agents** — Erza (ecosystem guidance), Mathias (voting), Aria (NFT creation), Debra (market analysis), Leo (X/Twitter).
- **Bots** — Debra on Discord and Telegram; Leo as a separate process for X.
- **Market data** — `fetchcandles.js` pulls OHLCV from GeckoTerminal into `project_candles/` for Debra’s analysis.

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

**Requirements:** Node.js (LTS).

1. Clone and install:
   ```bash
   git clone https://github.com/mathiaspellegrin/fluxpad
   cd fluxpad
   cp .env.example .env
   npm install
   ```
2. Edit `.env` with at least `OPENAI_API_KEY` (and other keys for the flows you need). Full list: [docs/config.md](docs/config.md).
3. Run the API:
   ```bash
   npm run dev
   ```
4. For candles, Discord, or Telegram, run those as separate processes. See [docs/running.md](docs/running.md).
5. Test agents from the terminal: `npm run test`.

**Troubleshooting:** [docs/troubleshooting.md](docs/troubleshooting.md).

## Config

Env vars cover: API keys (OpenAI, xAI), server `PORT`, Discord/Telegram tokens and channel IDs, X API creds, each agent’s wallet key (testnet only), and contract addresses. The full list—with short descriptions—is in [docs/config.md](docs/config.md).

## Deployment

See [docs/deployment.md](docs/deployment.md) (steps to be added when available).

## Security notes

Keep all secrets in `.env` (API keys, bot tokens, wallet keys). Do not commit `.env`. Use testnet keys and least-privilege tokens. Responsible disclosure and details: [SECURITY.md](SECURITY.md).

## Proof / Demo

- **Live:** [https://fluxpad.org/](https://fluxpad.org/)
- **Demo video:** [https://youtu.be/zMIFPvWzAqU](https://youtu.be/zMIFPvWzAqU)
- **Diagram:** [Excalidraw](https://excalidraw.com/#json=Nlokfw5MS6ragTlJ8GDp5,y-LhldPRmeIIKRjXBTGhoQ)

How to run it yourself: [docs/demo.md](docs/demo.md).

## Status

**Hackathon prototype (2nd place, Conflux).** This is the initial version; frontend and features have changed since the hackathon, and part of the codebase remains private (to be made public later). Core architecture and contracts here are stable; agent logic and integrations continue to evolve.

- **Solid:** API and agents (Erza, Mathias, Aria, Debra), Discord/Telegram/X bots, testnet contracts (Factory, Voting), candle pipeline.
- **Next:** [docs/roadmap.md](docs/roadmap.md).

**Contracts:** Mainnet deployments and full Fluxpad DeFi contract suite (FluxFactory, FluxTokenFactory, FluxNFTFactory, FluxTokenLockFactory, FluxRouter): [Fluxpad/contracts](https://github.com/Fluxpad/contracts).

## Contributing

[CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE).

## Contact

- Discord: mathiaspel | [FluxPad Community](https://discord.gg/5ZhArVUzUT)
- Website: [mbp-enterprises.com](https://mbp-enterprises.com)
