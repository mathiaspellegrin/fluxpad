# Running FluxPad

The backend is several **separate processes**. If you want the full picture—API plus Discord plus Telegram plus fresh candle data—you run them in parallel. Separate terminals, or something like PM2. Your call.

## 1. Candle fetcher (market data)

Grabs OHLCV from GeckoTerminal and writes it into `project_candles/`. Debra needs this for market analysis; without it she’s flying blind.

```bash
npm run fetchcandles
# or: node fetchcandles.js
```

Leave it running if you care about up-to-date candles.

## 2. Discord bot

```bash
npm run discord
# or: node discordDebraBot.js
```

## 3. Telegram bot

```bash
npm run telegram
# or: node telegramDebraBot.js
```

## 4. Main API server

This is what the frontend talks to. If the website’s supposed to work, this has to be up.

```bash
npm run dev
# or: npm start
# or: node index.js
```

## 5. (Optional) CLI test

Terminal UI to chat with the agents:

```bash
npm run test
# or: node test.js
```

## Order and requirements

- Get `.env` sorted first—see [config.md](config.md).
- Start order doesn’t really matter. The API doesn’t depend on the bots; the bots do need their tokens and channel IDs though.
- Want one command to rule them all? Use a process manager (e.g. **PM2**) to run `fetchcandles.js`, `discordDebraBot.js`, `telegramDebraBot.js`, and `index.js` at once.

## Minimal run (API only)

Just want the backend API—local frontend, or you’re only testing?

```bash
cp .env.example .env
# Edit .env: at least OPENAI_API_KEY and PORT
npm install
npm run dev
```

Discord, Telegram, and the candle fetcher are optional for that. Skip ’em if you don’t need ’em.
