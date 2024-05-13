// import { swap } from "./swap";
import { TOKEN_PROGRAM_ID, Token } from "@raydium-io/raydium-sdk";
import { PublicKey } from '@solana/web3.js';
import Decimal from 'decimal.js';

import { swap } from "./swapAmm";
import { BotConfig, connection, wallet, DEFAULT_TOKEN } from "./config";
import { moniterWallet } from "./moniterWallet";
import { getPrice } from "./getPrice";
import { initWallets, addToken, getAllWallets, getAllTokens, removeToken, setTokenStatus } from "./data";
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
                await swap(tokenA, tokenB, bt.AMMID, BotConfig.tokenSwapAmount);

                console.log(`\n* Bought new token: ${bt.Mint}`);
                setTokenStatus(bt.Mint, "Bought");
            }
        })
    }, BotConfig.intervalTime)
}

const sellNewTokens = () => {
    setInterval(() => {
        getAllTokens().forEach(async (bt) => {
            if (bt.Status === "Bought") {
                const curPrice = await getPrice(bt.Mint);
                console.log(`\n* TakeProfit of Token ${bt.Mint}: ${curPrice * 100 / bt.Price} %`);
                if (curPrice >= bt.Price * BotConfig.takeProfit) {
                    setTokenStatus(bt.Mint, "Wait")
                    const walletTokenInfs = await getWalletTokenAccount(connection, wallet.publicKey);
                    const acc = walletTokenInfs.find(account => account.accountInfo.mint.toString() === bt.Mint);
                    const bal = acc.accountInfo.amount
                    const amount = new Decimal(Number(bal)).div(10 ** bt.Decimal);
                    
                    const tokenA = new Token(TOKEN_PROGRAM_ID, new PublicKey(bt.Mint), bt.Decimal)
                    const tokenB = DEFAULT_TOKEN.WSOL
                    await swap(tokenA, tokenB, bt.AMMID, Number(amount));

                    console.log(`\n* Sold new Token: ${bt.Mint}`);

                    setTokenStatus(bt.Mint, "Sold");
                }
            }
        })
    }, BotConfig.intervalTime)
}


runBot();