# Troubleshooting

## ".env file" or "environment variable" errors

Make sure you’ve got a `.env` file in the project root—copy it from `.env.example`. Don’t commit `.env`; it’s in `.gitignore`, and every dev (or environment) should have their own. If the server or a bot complains about a missing key, [config.md](config.md) has the exact variable names.

## "Private key not found" or similar

- For NFT creation (Aria), set `ARIA_PRIVATE_CFX_WALLET` in `.env`.
- For voting (Mathias), set `MATHIAS_PRIVATE_CFX_WALLET`.
- Use **testnet** wallet keys only. Don’t put mainnet keys in `.env`—we’re not responsible for what happens next.

## Node version

Use a current LTS Node (e.g. 18 or 20). If you’re seeing `SyntaxError` or weird module resolution errors, upgrading Node often fixes it.

## Discord or Telegram bot not responding

Check `DISCORD_BOT_TOKEN` and `DISCORD_CHANNEL_ID` (or the Telegram equivalents). The bot has to be invited to the channel and have the right permissions. And yeah—make sure the bot process is actually running (`npm run discord` or `npm run telegram`).

## Candle data missing / Debra analysis empty

Run `npm run fetchcandles` (or `node fetchcandles.js`) and leave it running. It fills `project_candles/`. Debra uses that for market analysis; no candles, no analysis.

## Port already in use

Change `PORT` in `.env`, or kill whatever’s already using the port (e.g. another `node index.js` or some other app on 3000).

## Contract calls failing

Confirm you’re on Conflux eSpace **testnet** and that the contract addresses in `.env` match [contracts.md](contracts.md). Also make sure the wallet for that agent has a bit of testnet CFX for gas.
