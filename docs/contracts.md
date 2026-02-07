# Contracts and addresses

Everything below is **Conflux eSpace testnet**. Don’t plug in mainnet keys or mainnet addresses when you’re developing. Seriously.

## Contract addresses

| Contract | Address | Explorer |
|----------|---------|----------|
| **FluxPadFactory** (token/NFT creation) | `0x8DB86AB5C72b875Af8C7B36A4D916f071e1C9a78` | [ConfluxScan](https://evmtestnet.confluxscan.net/address/0x8db86ab5c72b875af8c7b36a4d916f071e1c9a78?tab=contract-viewer) |
| **ProjectVoting** | `0x2B77B6f8C5b7C7d5115dF095D75a09238081ea7f` | [ConfluxScan](https://evmtestnet.confluxscan.io/address/0x2b77b6f8c5b7c7d5115df095d75a09238081ea7f?tab=contract-viewer) |

## Contract roles

- **FluxPadFactory.** Mints tokens/NFTs; callers pay a creation fee. Aria drives this with `ARIA_PRIVATE_CFX_WALLET`.
- **ProjectVoting.** Owner can add/remove projects and set `mathiasAIAgent`. There’s a cooldown on voting. Mathias uses `MATHIAS_PRIVATE_CFX_WALLET` here.

## Agent addresses (demo)

These are the Conflux addresses the AI agents use in the demo. When you run things locally you’ll use your own keys; these are here for reference (e.g. double-checking on testnet).

| Agent | Address |
|-------|---------|
| LEO_AI_AGENT | `0x51741B5d4D28E2aA25d1366b0DdFc3681DB18Ec2` |
| ERZA_AI_AGENT | `0xf1d770cc446D5630D3eBC96f5D97e3561F65b30C` |
| DEBRA_AI_AGENT | `0x7791742f795ed16Ae35F0dD56054940dC81944f9` |
| ARIA_AI_AGENT | `0x287A89387892A3Bd28F972962a7E345340923AB9` |
| MATHIAS_AI_AGENT | `0x4BfDCf2e69a0cB3331812f6547AE5530217C6d35` |

## Community and bots

- **Discord:** [Join FluxPad Community](https://discord.gg/5ZhArVUzUT)
- **Telegram bot:** [@FluuxPadbot](https://t.me/FluuxPadbot)
- **Leo on X:** [@leofluxpad](https://x.com/leofluxpad)
