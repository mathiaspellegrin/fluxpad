# Architecture

## Overview

FluxPad’s backend isn’t one big process—it’s several. You’ve got the Express API, the bots (Discord, Telegram, X), a script that keeps candle data fresh, and a CLI for poking the agents. The frontend lives at fluxpad.org; it’s not in this repo.

## Dataflow

```
Frontend (fluxpad.org)  -->  index.js (Express API)
                                    |
                                    v
                            handlers.js  <--> characters/, knowledge/
                                    |
                    +---------------+---------------+
                    v               v               v
            Conflux eSpace    OpenAI API      projects.json,
            (voting, NFT)                     project_analyses.json

Separate processes (run in parallel):
  fetchcandles.js  -->  GeckoTerminal API  -->  project_candles/
  discordDebraBot.js   -->  Discord API
  telegramDebraBot.js  -->  Telegram API
  xLeoBot.js           -->  X API + Grok
```

## Components

| Component | File | Role |
|-----------|------|------|
| Backend API | `index.js` | Express server. Exposes chat endpoints per agent (Erza, Mathias, Aria, Debra). If the web app’s up, this needs to be running. |
| Agent logic | `handlers.js` | Where the agents actually do their thing: OpenAI calls, Conflux (voting, NFT factory). Reads `characters/characters.json` and the `knowledge/*.json` files. |
| Discord bot | `discordDebraBot.js` | Debra on Discord—same brain as the API, different interface. |
| Telegram bot | `telegramDebraBot.js` | Debra again, but on Telegram. |
| X (Twitter) bot | `xLeoBot.js` | Leo. Automated posts via X API and Grok. |
| Candle fetcher | `fetchcandles.js` | Pulls OHLCV from GeckoTerminal, writes into `project_candles/`. Debra leans on this for market analysis. |
| CLI test | `test.js` | Terminal UI to chat with Erza, Mathias, Aria, and Debra. |

## Key files and folders

- **`index.js`** — Main server. Stays up so the frontend and API keep working.
- **`handlers.js`** — Central logic for all the agents. (It’s a .js file, not handlers.json—easy to mix up.)
- **`projects.json`** — List of projects we track: name, lpContract, network, xAccount.
- **`project_analyses.json`** — Created at runtime. Holds the analysis data for each project.
- **`characters/`** — `characters.json` in here defines who each agent is and how they talk.
- **`knowledge/`** — Project-specific knowledge: `conflux.json`, `nucleon.json`, `fluxpad.json`, `swappi.json`, plus a `template.json`.

## Contracts

The smart contracts sit in `contracts/` and are deployed on Conflux eSpace testnet. Addresses and who-does-what: [contracts.md](contracts.md).

## Stack

- **Backend:** Node.js, Express
- **Blockchain:** Conflux eSpace (ethers.js)
- **AI:** OpenAI for the agents; Grok/xAI for Leo on X
