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
- An environment file (.env) with your RPC URL and WALLET_PRIVATE_KEY


## Configurations

Add your private key to a `config.ts` file:
Set some configuration settings

```env

export const TrackWallets = [
    'HzUjY1eHsGrwV1KrSqaLSkm48urhkExtok5cwz1rqD4',
    'EPhHN5wdPPeWoDutsHHHetJ9p4qWxkuAvDQSQmqSuy2D',
] // Wallet addresses you want to track

export const ThresholdAmount = 10000; // 10000 SOL

export const TokenBuyAmount = 5; // 5 SOL

export const TakeProfit = 0.2; // 20%

export const WALLET_PRIVATE_KEY = '<Your Wallet Private Key>'; // your wallet private key

```

Then run:

```sh
yarn ts-start
```
## Version 1.0,   11/5/2024