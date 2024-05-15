# Sniper Bot on Solana, Raydium

This project demonstrates my abilities how to perform the monitering wallet transactions and how to do token swap on the Solana blockchain using Raydium SDK.

## Features

- Track some wallet's transactions
- Once found a big SOL transition, then track its moving
- If new token and new pool are created, then buy it.
- According to the configurations, it causes some transactions like buy, sell new tokens.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed (v18 or above recommended)
- Yarn
- A Solana wallet with some SOL for testing the swap


## Configurations

Add your private key to a `config.ts` file:
Set some configuration settings

```env

export const BotConfig = {
    trackWallets: [
        '8gCibEuruXnD6scuFEgS1iUboUH11TsHEkDaLnNXyDiX',
        // '2GzeNrucUMKzGahMDMNgtYAjHXmUPAuC4AuPmTGS9a3D',
    ],
    threshold: 1000,
    takeProfit: 1.3,
    tokenSwapAmount: 0.5,
    intervalTime: 1000 * 2,
};

const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY; //chainge to your wallet private key

```

Then run:

```sh
yarn clean

yarn build

yarn start
```
## Version 1.0,   11/5/2024