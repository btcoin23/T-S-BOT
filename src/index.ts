// import { swap } from "./swap";
import { TOKEN_PROGRAM_ID, Token } from "@raydium-io/raydium-sdk";
import { PublicKey } from '@solana/web3.js';

import { swap } from "./swapAmm";
import { BotConfig, connection, wallet, DEFAULT_TOKEN } from "./config";
import { moniterWallet } from "./moniterWallet";
import { getPrice } from "./getPrice";
import { initWallets, getAllWallets, getAllTokens, setTokenStatus } from "./data";
import { getWalletTokenAccount } from './util';

const runBot = async() => {
    initWallets();
    moniterWallets();
    buySellToken();
}

const moniterWallets = () => {
    getAllWallets().forEach((wal: any) => {
        moniterWallet(wal);
    })
}

const buySellToken = () => {
    setInterval(() => {
        getAllTokens().forEach(async (bt) => {
            if (bt.Status === "None")
                buyToken(bt);
            else if (bt.Status === "Bought") {
                const walletInfs = await getWalletTokenAccount(connection, wallet.publicKey);
                const one = walletInfs.find(i => i.accountInfo.mint.toString() === bt.Mint);
                if(one){
                    const curPrice = await getPrice(bt.Mint);
                    console.log(`* TakeProfit of Token ${bt.Mint}: ${curPrice * 100 / bt.Price} %`);
                    if (curPrice >= bt.Price * BotConfig.takeProfit) {
                        sellToken(bt)
                    }
                }else{
                    buyToken(bt);
                }
            }else if (bt.Status === "Sold"){
                const walletInfs = await getWalletTokenAccount(connection, wallet.publicKey);
                const one = walletInfs.find(i => i.accountInfo.mint.toString() === bt.Mint);
                if(one){
                    sellToken(bt)
                }
            }
        })
    }, BotConfig.intervalTime)
}

const buyToken = async(bt: any) => {
    setTokenStatus(bt.Mint, "Wait")
    const tokenA = DEFAULT_TOKEN.WSOL
    const tokenB = new Token(TOKEN_PROGRAM_ID, new PublicKey(bt.Mint), bt.Decimal)
    const res = await swap(tokenA, tokenB, bt.AMMID, BotConfig.tokenSwapAmount * (10 ** 9));
    console.log(`\n* Bought new token: ${bt.Mint} https://solscan.io/tx/${res}`);
    setTimeout(() => {
        setTokenStatus(bt.Mint, "Bought"); 
    }, 1000 * 10);
}

const sellToken = async(bt: any) => {
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
    setTimeout(() => {
        setTokenStatus(bt.Mint, "Sold");
    }, 1000 * 10);
}

runBot();