"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapConfig = exports.MyWallet = exports.RAYDIUM_PUBLIC_KEY = exports.Solana_Connection = exports.RPC_URL = exports.WSOL_Mint = exports.IntervalTime = exports.WALLET_PRIVATE_KEY = exports.TakeProfit = exports.TokenBuyAmount = exports.ThresholdAmount = exports.TrackWallets = void 0;
require("dotenv/config");
const web3_js_1 = require("@solana/web3.js");
const web3_js_2 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
exports.TrackWallets = [
    'HzUjY1eHsGrwV1KrSqaLSkm48urhkExtok5cwz1rqD4',
    'EPhHN5wdPPeWoDutsHHHetJ9p4qWxkuAvDQSQmqSuy2D',
];
exports.ThresholdAmount = 0.00001; // 0.00001 SOL
exports.TokenBuyAmount = 0.01; // 0.01 SOL
exports.TakeProfit = 0.2; // 20%
exports.WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY;
exports.IntervalTime = 1000 * 30;
exports.WSOL_Mint = 'So11111111111111111111111111111111111111112';
exports.RPC_URL = process.env.RPC_URL;
exports.Solana_Connection = new web3_js_1.Connection(exports.RPC_URL);
exports.RAYDIUM_PUBLIC_KEY = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
exports.MyWallet = web3_js_2.Keypair.fromSecretKey(Buffer.from(bs58_1.default.decode(exports.WALLET_PRIVATE_KEY))); // insert your privatekey here
exports.SwapConfig = {
    executeSwap: true, // Send tx when true, simulate tx when false
    useVersionedTransaction: true,
    // tokenAAmount: 0.01, // Swap 0.01 SOL for USDT in this example
    // tokenAAddress: "So11111111111111111111111111111111111111112", // Token to swap for the other, SOL in this case
    // tokenBAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDC address
    maxLamports: 1500000, // Micro lamports for priority fee
    direction: "in", // Swap direction: 'in' or 'out'
    liquidityFile: "https://api.raydium.io/v2/sdk/liquidity/mainnet.json",
    maxRetries: 20,
};
