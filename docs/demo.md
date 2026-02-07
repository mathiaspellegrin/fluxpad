# Demo

## Live and video

- **Live app:** [https://fluxpad.org/](https://fluxpad.org/)
- **Demo video:** [https://youtu.be/zMIFPvWzAqU](https://youtu.be/zMIFPvWzAqU)
- **Architecture diagram:** [Excalidraw](https://excalidraw.com/#json=Nlokfw5MS6ragTlJ8GDp5,y-LhldPRmeIIKRjXBTGhoQ)

## Reproducing locally

1. **Setup.** Clone the repo, copy `.env.example` to `.env`, and fill in at least `OPENAI_API_KEY`—plus whatever else you need for the flows you want to try. Then `npm install`.
2. **API.** Start the backend with `npm run dev`. The live frontend at fluxpad.org talks to its own API; to run a full local demo you’d run the frontend locally too and point it at something like `http://localhost:3000` (or whatever your `PORT` is).
3. **Agents to try:**
   - **Erza** — Ecosystem guidance, tutorials, “where do I start” kind of stuff.
   - **Mathias** — On-chain voting on proposals.
   - **Aria** — Token/NFT creation via the factory contract.
   - **Debra** — Market analysis. Run `npm run fetchcandles` so she has candle data; she’s also on Discord and Telegram if you spin up those bots.
4. **CLI.** Run `npm run test` to talk to Erza, Mathias, Aria, and Debra from the terminal.

For the full multi-process dance (candles + Discord + Telegram + API), see [running.md](running.md).
