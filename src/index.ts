import { initRaydiumSwap, swap } from "./swap";
import { WSOL_Mint, IntervalTime, TokenBuyAmount, Solana_Connection, MyWallet, TakeProfit } from "./config";
import { moniterWallet } from "./moniterWallet";
import { TOKEN_PROGRAM_ID, SPL_ACCOUNT_LAYOUT } from "@raydium-io/raydium-sdk";
import { TokenAccount } from "@raydium-io/raydium-sdk";
import { Connection, PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { getPrice } from "./getPrice";

import { initializeWallets, addNewToken, getWallets, getNewTokens, removeNewToken, setBoughtToken } from "./data";

const runBot = async() => {
    initializeWallets();
    moniterWallets();
    // initTokens();
    initRaydiumSwap();
    buyNewTokens();
    sellNewTokens();
}

const initTokens = () => {
    addNewToken('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 6) //USDT
    addNewToken('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6) //USDC
    // addNewToken('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') //USDC
}

const moniterWallets = () => {
    getWallets().forEach((wal: any) => {
        moniterWallet(new PublicKey(wal));
    })
}

const buyNewTokens = () => {
    setInterval(() => {
        getNewTokens().forEach(async(bt) => {
            console.log(`Checking new token: ${bt.Mint}`);
            if (!bt.Bought) {
                await swap(WSOL_Mint, bt.Mint, TokenBuyAmount);
                console.log('bought-----------');
                setBoughtToken(bt.Mint);
            }
        })
    }, IntervalTime)
}

const sellNewTokens = () => {
    setInterval(() => {
        getNewTokens().forEach(async (bt) => {
            console.log(bt.Mint);
            if (bt.Bought) {
                const curPrice = await getPrice(bt.Mint);
                if (curPrice >= bt.Price * (TakeProfit)) {
                    console.log(`cur price: ${curPrice},  price: ${bt.Price}`)
                    const walletTokenInfs = await getWalletTokenAccount(Solana_Connection, MyWallet.publicKey);
                    const acc = walletTokenInfs.find(account => account.accountInfo.mint.toString() === bt.Mint.toString());
                    const bal = acc.accountInfo.amount
                    const amount = new Decimal(Number(bal)).div(10 ** bt.Decimal);
                    console.log(`here----> ${Number(amount)}`);
                    await swap(bt.Mint, WSOL_Mint, Number(amount));
                    console.log('sold-----------');
                    removeNewToken(bt.Mint);
                }
            }
        })
    }, IntervalTime)
}

export async function getWalletTokenAccount(connection: Connection, wallet: PublicKey): Promise<TokenAccount[]> {
    const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID,
    });
    return walletTokenAccount.value.map((i) => ({
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
}


runBot();