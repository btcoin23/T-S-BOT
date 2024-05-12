import 'dotenv/config';
import { Connection } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';
import base58 from "bs58"

export const TrackWallets = [
    'FjEKhdhqskSHUgkTxuDA55WoynHx6UyCxxS7caX1QXJi',
    'N22uCb2j9GriychZJzh9t5idaddLdkHhANNH27GUPYC'
]
export const ThresholdAmount = 1000; // 0.00001 SOL
export const TokenBuyAmount = 0.1; // 0.01 SOL
export const TakeProfit = 0.2; // 20%
// export const WALLET_PRIVATE_KEY = 'Your Wallet Private Key';
export const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;

export const IntervalTime = 1000 * 60 * 5
export const WSOL_Mint = 'So11111111111111111111111111111111111111112'
export const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=45d2a95e-937d-4802-8487-98dec2736fc9';
export const Solana_Connection = new Connection(RPC_URL);
export const RAYDIUM_PUBLIC_KEY = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
export const MyWallet = Keypair.fromSecretKey(Buffer.from(base58.decode(WALLET_PRIVATE_KEY))) // insert your privatekey here

export const SwapConfig = {
    executeSwap: true, // Send tx when true, simulate tx when false
    useVersionedTransaction: true,
    // tokenAAmount: 0.01, // Swap 0.01 SOL for USDT in this example
    // tokenAAddress: "So11111111111111111111111111111111111111112", // Token to swap for the other, SOL in this case
    // tokenBAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDC address
    maxLamports: 1500000, // Micro lamports for priority fee
    direction: "out" as "in" | "out", // Swap direction: 'in' or 'out'
    liquidityFile: "https://api.raydium.io/v2/sdk/liquidity/mainnet.json",
    maxRetries: 20,
};