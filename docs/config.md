# Configuration

Everything’s driven by environment variables. Copy [../.env.example](../.env.example) to `.env`, fill in the blanks, and for heaven’s sake don’t commit `.env`.

## Full environment variable list

| Variable | Description |
|----------|-------------|
| **OPENAI_API_KEY** | OpenAI key. Powers the agent replies (Erza, Mathias, Aria, Debra). |
| **XAI_API_KEY** | xAI/Grok key. Leo uses it for Twitter content. |
| **PORT** | Port the main server (`index.js`) listens on. Default’s 3000. |
| **DISCORD_BOT_TOKEN** | Discord bot token for Debra. |
| **DISCORD_CHANNEL_ID** | Channel ID where the bot reads and posts. |
| **TELEGRAM_BOT_TOKEN** | Telegram bot token for Debra. |
| **TELEGRAM_CHANNEL_ID** | Telegram channel or chat ID. |
| **X_ACCESS_TOKEN** | X (Twitter) API access token—for Leo. |
| **X_ACCESS_TOKEN_SECRET** | X API access token secret. |
| **X_API_KEY** | X API consumer key. |
| **X_API_SECRET_KEY** | X API consumer secret. |
| **DEBRA_PRIVATE_CFX_WALLET** | Conflux eSpace wallet private key for the Debra agent. |
| **LEO_PRIVATE_CFX_WALLET** | Conflux eSpace wallet private key for Leo. |
| **ARIA_PRIVATE_CFX_WALLET** | Conflux eSpace wallet private key for Aria (e.g. NFT creation). |
| **MATHIAS_PRIVATE_CFX_WALLET** | Conflux eSpace wallet private key for Mathias (voting). |
| **ERZA_PRIVATE_CFX_WALLET** | Conflux eSpace wallet private key for Erza. |
| **FLUXPAD_VOTING_CONTRACT_ADDRESS** | ProjectVoting contract (testnet). |
| **FLUXPAD_FACTORY_CONTRACT_ADDRESS** | FluxPadFactory contract (testnet). |

Stick to testnet keys and narrow scopes when you’re developing. More on security: [SECURITY.md](../SECURITY.md).
