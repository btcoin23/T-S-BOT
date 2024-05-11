import { swap } from "./swap";
import { WSOL_Mint, IntervalTime, TokenBuyAmount, Solana_Connection, MyWallet, TakeProfit } from "./config";
import { moniterWallet } from "./moniterWallet";
import { TOKEN_PROGRAM_ID, SPL_ACCOUNT_LAYOUT } from "@raydium-io/raydium-sdk";
import { TokenAccount } from "@raydium-io/raydium-sdk";
import { Connection, PublicKey } from '@solana/web3.js';
import { getPrice } from "./getPrice";

import { initializeWallets, getWallets, getNewTokens, removeNewToken, setBoughtToken } from "./data";

const runBot = () => {
    initializeWallets();
    moniterWallets();
    buyNewTokens();
    sellNewTokens();
}

const moniterWallets = () => {
    getWallets().forEach((wal: any) => {
        moniterWallet(new PublicKey(wal));
    })
}

const buyNewTokens = () => {
    setInterval(() => {
        getNewTokens().forEach(bt => {
            if (!bt.Bought) {
                swap(WSOL_Mint, bt.Mint, TokenBuyAmount);
                setBoughtToken(bt.Mint);
            }
        })
    }, IntervalTime)
}

const sellNewTokens = () => {
    setInterval(() => {
        getNewTokens().forEach(async (bt) => {
            const curPrice = await getPrice(bt.Mint);
            if (curPrice >= bt.Price * TakeProfit) {
                const walletTokenInfs = await getWalletTokenAccount(Solana_Connection, MyWallet.publicKey);
                const acc = walletTokenInfs.find(account => account.accountInfo.mint.toString() === bt.toString());
                const bal = acc.accountInfo.amount;
                swap(bt.Mint, WSOL_Mint, bal);
                removeNewToken(bt.Mint);
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