import { TxVersion, LOOKUP_TABLE_CACHE, Token, TOKEN_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import base58 from "bs58"
import 'dotenv/config';

//---------------------------------------------------------------- User setting
export const BotConfig = {
    trackWallet: 'Zf7wXt9Axmu84t47Qunkt2Ny2rtRAP7esNFqJZK1Xxd',
        // 'N22uCb2j9GriychZJzh9t5idaddLdkHhANNH27GUPYC',
        // 'FjEKhdhqskSHUgkTxuDA55WoynHx6UyCxxS7caX1QXJi',
    threshold: 1000,// 1000 SOL
    takeProfit: 1.3,// 30% Profit
    tokenSwapAmount: 0.01,// 0.5 Sol
    intervalTime: 1000 * 2,
    maxLamports: 1500000,
};

// const WALLET_PRIVATE_KEY = '<Your Wallet Private Key>'; //chainge to your wallet private key
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY; //chainge to your wallet private key

//---------------------------------------------------------------- Constant setting
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=862ad7b7-85d0-42aa-9f78-db1e34dc241b';
const WSS_URL = 'wss://mainnet.helius-rpc.com/?api-key=862ad7b7-85d0-42aa-9f78-db1e34dc241b';
export const connection = new Connection(RPC_URL, {wsEndpoint: WSS_URL});
export const makeTxVersion = TxVersion.V0; // LEGACY
export const addLookupTableInfo = LOOKUP_TABLE_CACHE
export const RAYDIUM_PUBLIC_KEY = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
export const wallet = Keypair.fromSecretKey(Buffer.from(base58.decode(WALLET_PRIVATE_KEY)))

export const DEFAULT_TOKEN = {
    'WSOL': new Token(TOKEN_PROGRAM_ID, new PublicKey('So11111111111111111111111111111111111111112'), 9, 'WSOL', 'WSOL'),
    'USDT': new Token(TOKEN_PROGRAM_ID, new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'), 6, 'USDT', 'USDT'),
    'USDC': new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC'),
    'RAY': new Token(TOKEN_PROGRAM_ID, new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), 6, 'RAY', 'RAY'),
    'TEST': new Token(TOKEN_PROGRAM_ID, new PublicKey('KfsoGQPrCP47zYDekWZPjQsLTwMKC3keHxrKtQAFF7g'), 8, 'TEST', 'TEST'),
  }