import { TxVersion, LOOKUP_TABLE_CACHE, Token, TOKEN_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import base58 from "bs58"
import 'dotenv/config';

//---------------------------------------------------------------- User setting
export const BotConfig = {
    trackWallets: [
        '8gCibEuruXnD6scuFEgS1iUboUH11TsHEkDaLnNXyDiX',
        // '2GzeNrucUMKzGahMDMNgtYAjHXmUPAuC4AuPmTGS9a3D',
        // '8Ku7ykby9J9Mf5hqeUNHxhFnvXcCWcHMHiw3EAUc25eh',
        // 'J7RmdJ3HnUE5issbeRC6uF64Q84JeZemokG8Vu48mxMy',
        // '29hPG7SkqX2BberrydaoEnmKcbAZyj1r6U5qpTLS91cN',
        // '5z4X9bJtHy6iz22uS3Bmrk3A5J3JhJowwN5K5BJ1GYz8',
        // 'Cx3vo64MnAnxEkKVSMbDazsFxxpNLoGYFdJW4Zripn6K',
        // '5XgFTiEA1X6P3DQStijxnhFMaRwaGzU2cguTtvMxpe9Y',
        // '5bWogTDsnzuDQZ9pRdvk74z1Qj3LRGFgPy9ZbDtiYBxS',
        // 'FjEKhdhqskSHUgkTxuDA55WoynHx6UyCxxS7caX1QXJi',
        // 'N22uCb2j9GriychZJzh9t5idaddLdkHhANNH27GUPYC',
        // 'J9TfJHNu8PY78fP5s7fw29y8HE8fnRFUQKQ5Sm48ZqYi',
        // 'FTtgnLCyg6UuPGvxktbaRcqcryDQyF3NnE5smgSHkNzp',
        // '7Mmzz7AAKJYfsMAXaoJSmBnFWVyXUwU7p3nK26Yz2gHY',
        //'CU7aczodxt3y6sDYJNT1VRxY54PcbFkiNyRfxuRKjsPA',
        //'9XnGGrvk5x1j4w2reWPPSg1atnswRSXbSAB2CH1RkncH',
        //'A42h43yxnVGu1MgS97b1iSHK2fQP1VCpC9LEQdftgCN8',
        //'Gn9xi6m8327FkvF8exmJhK49Jn1vMKbefpRrAazrNPfr'
    ],
    threshold: 1000,// 1000 SOL
    takeProfit: 1.3,// 30% Profit
    tokenSwapAmount: 0.5,// 0.5 Sol
    intervalTime: 1000 * 2,
};

const WALLET_PRIVATE_KEY = '<Your Wallet Private Key>'; //chainge to your wallet private key
// const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY; //chainge to your wallet private key

//---------------------------------------------------------------- Constant setting
const RPC_URL = 'https://white-neat-pool.solana-mainnet.quiknode.pro/54b0ef9ddb7ad7f1b3a7916401c702afff30cc2e/';
export const connection = new Connection(RPC_URL);
export const makeTxVersion = TxVersion.V0; // LEGACY
export const addLookupTableInfo = LOOKUP_TABLE_CACHE
export const RAYDIUM_PUBLIC_KEY = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
export const wallet = Keypair.fromSecretKey(Buffer.from(base58.decode(WALLET_PRIVATE_KEY)))

export const DEFAULT_TOKEN = {
    'WSOL': new Token(TOKEN_PROGRAM_ID, new PublicKey('So11111111111111111111111111111111111111112'), 9, 'WSOL', 'WSOL'),
    'USDT': new Token(TOKEN_PROGRAM_ID, new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'), 6, 'USDT', 'USDT'),
    'USDC': new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC'),
    'RAY': new Token(TOKEN_PROGRAM_ID, new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), 6, 'RAY', 'RAY'),
    'TEST': new Token(TOKEN_PROGRAM_ID, new PublicKey('Wp5w6KmJHdBpLqzJXfUqV3ddPxt1XLSTv3rimcPi1Lz'), 8, 'TEST', 'TEST'),
  }