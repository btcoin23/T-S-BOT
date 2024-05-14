// import { swap } from "./swap";
import { TOKEN_PROGRAM_ID, Token } from "@raydium-io/raydium-sdk";
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';

import { swap } from "./swapAmm";
import { BotConfig, connection, wallet, DEFAULT_TOKEN } from "./config";
import { moniterWallet } from "./moniterWallet";
import { getPrice } from "./getPrice";
import { initWallets, addToken, getAllWallets, getAllTokens, removeToken, setTokenStatus, updateTokenPrice } from "./data";
import { getWalletTokenAccount } from './util';

const runBot = async() => {
    initWallets();
    moniterWallets();
    buyNewTokens();
    sellNewTokens();
}

const moniterWallets = () => {
    getAllWallets().forEach((wal: any) => {
        moniterWallet(wal);
    })
}

const buyNewTokens = () => {
    setInterval(() => {
        getAllTokens().forEach(async(bt) => {
            if(bt.Status === "None")
            {
                setTokenStatus(bt.Mint, "Wait")

                const tokenA = DEFAULT_TOKEN.WSOL
                const tokenB = new Token(TOKEN_PROGRAM_ID, new PublicKey(bt.Mint), bt.Decimal)
                const res = await swap(tokenA, tokenB, bt.AMMID, BotConfig.tokenSwapAmount * (10 ** 9));
                const walletTokenInfs = await getWalletTokenAccount(connection, wallet.publicKey);
                const acc = walletTokenInfs.find(account => account.accountInfo.mint.toString() === bt.Mint);
                if(acc){
                    console.log(`\n* Bought new token: ${bt.Mint} https://solscan.io/tx/${res}`);
                    setTokenStatus(bt.Mint, "Bought");
                }
            }
        })
    }, BotConfig.intervalTime)
}

const sellNewTokens = () => {
    setInterval(() => {
        getAllTokens().forEach(async (bt) => {
            if (bt.Status === "Bought") {
                const curPrice = await getPrice(bt.Mint);
                console.log(`* TakeProfit of Token ${bt.Mint}: ${curPrice * 100 / bt.Price} %`);
                if (curPrice >= bt.Price * BotConfig.takeProfit) {
                    setTokenStatus(bt.Mint, "Wait")
                    const walletTokenInfs = await getWalletTokenAccount(connection, wallet.publicKey);
                    const acc = walletTokenInfs.find(account => account.accountInfo.mint.toString() === bt.Mint);
                    if(acc){
                        const bal = acc.accountInfo.amount
                        const tokenA = new Token(TOKEN_PROGRAM_ID, new PublicKey(bt.Mint), bt.Decimal)
                        const tokenB = DEFAULT_TOKEN.WSOL
                        const res = await swap(tokenA, tokenB, bt.AMMID, Number(bal));
                        console.log(`\n* Sold new Token: ${bt.Mint} https://solscan.io/tx/${res}`);
                    }
                    setTokenStatus(bt.Mint, "Sold");
                }
            }
        })
    }, BotConfig.intervalTime)
}


runBot();