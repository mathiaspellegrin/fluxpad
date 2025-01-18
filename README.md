# FluxPad

Thought for a second
FluxPad is a multi-agent AI platform built on the Conflux blockchain. It streamlines on-chain tasks through specialized AI agents that handle everything from token/NFT creation to real-time market analysis and automated social media updates. By integrating smart contracts, AI-driven functionalities, and various social platforms, FluxPad simplifies asset management, community governance, and ecosystem onboarding.

## Key Features

FluxPad is available at [https://fluxpad.org/](https://fluxpad.org/), providing users with a comprehensive online platform to interact with its powerful AI agents and explore the Conflux ecosystem.

A demo of FluxPad is available at [https://youtu.be/zMIFPvWzAqU](https://youtu.be/zMIFPvWzAqU), showcasing its features and functionality.

FluxPad utilizes the following resources:

- **Contracts:**
  - Factory token/NFT creation: [View Contract](https://evmtestnet.confluxscan.net/address/0x8db86ab5c72b875af8c7b36a4d916f071e1c9a78?tab=contract-viewer)
  - Vote contract: [View Contract](https://evmtestnet.confluxscan.io/address/0x2b77b6f8c5b7c7d5115df095d75a09238081ea7f?tab=contract-viewer)
- **Community Channels:**
  - Discord: [Join FluxPad Community](https://discord.gg/5ZhArVUzUT)
  - Telegram bot: [@FluuxPadbot](https://t.me/FluuxPadbot)
  - Leo X account: [Follow Leo on X](https://x.com/leofluxpad)

The AI agents in the demo use the following addresses:

- **LEO_AI_AGENT**: `0x51741B5d4D28E2aA25d1366b0DdFc3681DB18Ec2`
- **ERZA_AI_AGENT**: `0xf1d770cc446D5630D3eBC96f5D97e3561F65b30C`
- **DEBRA_AI_AGENT**: `0x7791742f795ed16Ae35F0dD56054940dC81944f9`
- **ARIA_AI_AGENT**: `0x287A89387892A3Bd28F972962a7E345340923AB9`
- **MATHIAS_AI_AGENT**: `0x4BfDCf2e69a0cB3331812f6547AE5530217C6d35`

In the near future, a dedicated server will be launched to allow developers to access the AI agents directly through endpoints. This server will be accessible at [https://fluxpad-database.com/](https://fluxpad-database.com/).

- **Token & NFT Creation**: Easily mint tokens or NFTs via smart contracts or delegate to the AI agent (Aria).
- **Market Analysis**: Track live price feeds with Debra and receive regular updates on Discord/Telegram.
- **On-Chain Voting**: Vote on proposals directly or through Mathias, eliminating manual contract interactions.
- **Social Media Updates**: Leo handles automated postings on Twitter (X) for project news.
- **Conflux Ecosystem Guidance**: Erza offers tutorials and links for new users exploring the Conflux network.

Use FluxPad for a seamless, AI-powered experience in the Conflux ecosystem—from minting NFTs to coordinating community votes.

## Getting Started

### Prerequisites

- Basic familiarity with blockchain and back-end development.

Ensure you have Node.js installed and set up your environment variables as described in the Environment Variables section.

### Installation

1. Clone the FluxPad repository:
   ```bash
   git clone https://github.com/mathiaspellegrin/fluxpad
   ```
2. Navigate to the project directory:
   ```bash
   cd fluxpad
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development and Technology Stack

### Environment Variables

The following environment variables are required for FluxPad's functionality. Ensure these are properly configured in a `.env` file:

```
OPENAI_API_KEY=
PORT=
DISCORD_BOT_TOKEN=
DISCORD_CHANNEL_ID=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
XAI_API_KEY=
DEBRA_PRIVATE_CFX_WALLET=
LEO_PRIVATE_CFX_WALLET=
ARIA_PRIVATE_CFX_WALLET=
MATHIAS_PRIVATE_CFX_WALLET=
ERZA_PRIVATE_CFX_WALLET=
X_ACCESS_TOKEN=
X_ACCESS_TOKEN_SECRET=
X_API_KEY=
X_API_SECRET_KEY=
FLUXPAD_VOTING_CONTRACT_ADDRESS=0x2B77B6f8C5b7C7d5115dF095D75a09238081ea7f
FLUXPAD_FACTORY_CONTRACT_ADDRESS=0x8DB86AB5C72b875Af8C7B36A4D916f071e1C9a78
```

### Back-End Logic

The FluxPad platform's back-end leverages Node.js and Express.js to handle AI agent interactions, blockchain communication, and real-time data processing. Key functionalities include:

- Context-aware responses from specialized AI agents.
- Secure handling of user data and project information.
- Integration with Conflux blockchain for smart contract execution and market analysis.
- Automated periodic analysis of project trends and trading patterns.

#### Key Files and Folders
- **`index.js`**: The main server file. This terminal must always be running as it powers the bots and the xLeoBot functionalities.
- **`projects.json`**: Contains the list of all projects tracked by FluxPad.
- **`project_analyses.json`**: Stores the analysis data for the projects.
- **`characters/`**: Contains `characters.json`, which defines the AI agent personalities and prompts.
- **`knowledge/`**: Stores individual project knowledge files (e.g., `conflux.json`, `nucleon.json`), enabling AI agents to access detailed project-specific information.
- **`handlers.json`**: Central file for managing the logic of all AI agents.

Ensure these files and folders are properly configured and updated to maintain functionality.

- **Frontend**: React.js (accessible trough the website)
- **Backend**: Node.js, Express
- **Blockchain**: Conflux eSpace
- **AI Integration**: OpenAI API for AI agent functionality and Grok xai for Twitter

### Usage

To test FluxPad's features, multiple terminals are required:

1. **Run `fetchCandles`**
   In the first terminal, start the `fetchCandles` process by running:
   ```bash
   node fetchCandles.js
   ```
   This script fetches real-time OHLCV (Open, High, Low, Close, Volume) data from GeckoTerminal and stores it locally for analysis. Keep this terminal running to ensure continuous updates to the candle data.

2. **Run the Discord Bot**
   In the second terminal, run the Discord bot to enable AI-powered interactions via Discord:
   ```bash
   node discordDebraBot.js
   ```

3. **Run the Telegram Bot**
   In the third terminal, start the Telegram bot to allow users to interact with Debra on Telegram:
   ```bash
   node telegramDebraBot.js
   ```

4. **Run the Main Test File**
   In the fourth terminal, execute the test file to interact with all available AI agents and test their functionalities:
   ```bash
   node test.js
   ```

### Notes:
- Ensure the `.env` file is configured before running any of the scripts.
- If you prefer not to use multiple terminals, you can use tools like `pm2` to manage and run all scripts concurrently in the background.
- `fetchCandles.js` is essential for maintaining up-to-date market data, which the AI agents rely on for accurate analysis.
- Each bot requires its own terminal to function independently, enabling seamless interaction across multiple platforms.

## Contributing

This repository contains the back-end logic of FluxPad, making it a resource for developers who want to create similar projects or contribute to the development of FluxPad itself. By engaging with this repository, you can explore the architecture, test existing features, or expand its capabilities to further enhance the platform.

We welcome contributions to enhance FluxPad. To contribute:

1. Fork the repository.
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions, suggestions, or support, reach out via:

- Discord (Direct): mathiaspel
- Website: [mbp-enterprises.com](https://mbp-enterprises.com)

