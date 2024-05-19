import { PublicKey, LAMPORTS_PER_SOL, PartiallyDecodedInstruction, ConfirmedSignatureInfo } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, Token } from "@raydium-io/raydium-sdk";
import { getMint } from '@solana/spl-token';
import { swap } from './swapAmm';
import { connection, wallet, BotConfig, RAYDIUM_PUBLIC_KEY, DEFAULT_TOKEN } from './config';
import { getWalletTokenAccount } from './util';
import { getPrice } from "./getPrice";
import { SingleBar, Presets } from "cli-progress";


let signatureInfo: ConfirmedSignatureInfo[];
let lastSignature: string;

let curWallet: PublicKey;
let curState: string;
let curAmmId: string;
let curToken: Token;
let initialPrice: number;

let curTime: number = 0;
let maxDuration: number = 0;

let newTokenMint: string;

const opt = {
    format: "TakeProfit: {percentage}% | ETA: {eta}s | {value}/{total}",
};
const progressBar = new SingleBar(
    opt,
    Presets.shades_classic
);


const main = async () => {
    await init()
    moniterWallet()
    console.log(`\n---------- Checking wallet: ${curWallet} ... ----------`);
}

const init = async () => {
    curWallet = new PublicKey(BotConfig.trackWallet);
    signatureInfo = await connection.getSignaturesForAddress(curWallet, { limit: 1 });
    lastSignature = signatureInfo[0].signature;
    curState = "None"
    curTime = Date.now();
}

const moniterWallet = async () => {
    try {
        signatureInfo = await connection.getSignaturesForAddress(curWallet, { until: lastSignature }, "finalized");
        if (signatureInfo.length > 0 && lastSignature != signatureInfo[0].signature) {
            lastSignature = signatureInfo[0].signature;
            // console.log(lastSignature)
            const sigArray = signatureInfo.filter(sig => !sig.err).map(sig => sig?.signature);
            const trxs = await connection.getParsedTransactions(sigArray, { maxSupportedTransactionVersion: 0 });
            const txs = trxs.filter(trx => trx?.transaction)
            txs.forEach(async (tx) => {
                const isTransferred: any = tx.transaction.message.instructions.find((item: any) =>
                    item.parsed?.type === 'transfer'
                )
                if (isTransferred) {
                    const txAmount = tx.meta.postBalances[0] - tx.meta.preBalances[0];
                    const sender = tx.transaction.message.accountKeys[0].pubkey.toString();
                    const recipient = tx.transaction.message.accountKeys[1].pubkey.toString();
                    if (sender === curWallet.toString()) {                      
                        if (txAmount <= -BotConfig.threshold * LAMPORTS_PER_SOL) {
                            signatureInfo = await connection.getSignaturesForAddress(curWallet, { limit: 100 });
                            const sigs = signatureInfo.filter(sig => !sig.err).map(sig => sig?.signature);
                            const txns = await connection.getParsedTransactions(sigs, { maxSupportedTransactionVersion: 0 });
                            lastSignature = txns.find(tr => tr.transaction.message.accountKeys[0].pubkey.toString() === curWallet.toString()).transaction.signatures[0]
                            console.log(`\n# Last transaction of new wallet: https://solscan.io/tx/${lastSignature}`)

                            curState = "None"
                            curWallet = new PublicKey(recipient)
                            const log = {
                                'Signature:': `https://solscan.io/tx/${tx.transaction.signatures}`,
                                'From:': sender,
                                'To:': recipient,
                                'Amount:': `${-txAmount / LAMPORTS_PER_SOL} SOL`
                            }
                            console.log(`\n# Detected over ${BotConfig.threshold} Sol transferring`)
                            console.table(log)
                            console.log(`\n---------- Checking wallet: ${curWallet} ... ----------`);
                        }else { // if (txAmount <= -BotConfig.oneSol * LAMPORTS_PER_SOL) {
                            const duration = (tx.blockTime - curTime) / 1000;
                            curTime = tx.blockTime
                            if (duration > maxDuration)
                                maxDuration = duration
                            // console.log(duration + ' / ' + maxDuration)
                        }

                    }
                } else {
                    const isMinted: any = tx.transaction.message.instructions.find((item: any) =>
                        item.parsed?.type === 'mintTo'
                    )
                    if (isMinted) {
                        const tokenMint: string = isMinted.parsed.info.mint;
                        if (tokenMint === newTokenMint) return
                        newTokenMint = tokenMint;
                        const amount: number = isMinted.parsed.info.amount;
                        const tokenMintInfo = await getMint(connection, new PublicKey(tokenMint));
                        const decimal: number = tokenMintInfo.decimals
                        const frozenToken: boolean = tokenMintInfo.freezeAuthority == null ? true : false;
                        const log = {
                            'Signature:': `https://solscan.io/tx/${tx.transaction.signatures}`,
                            'Token Mint:': tokenMint,
                            'Decimal:': decimal,
                            'Amount:': amount,
                            'Frozen:': frozenToken
                        }
                        console.log('\n# New token is minted')
                        console.table(log)

                    } else {
                        //check new Pool information
                        const interactRaydium = tx.transaction.message.instructions.find((item: any) =>
                            item.programId.toString() === RAYDIUM_PUBLIC_KEY
                        ) as PartiallyDecodedInstruction
                        const createdPool = tx.meta.logMessages?.find((item: string) => item.includes('Create'))
                        if (interactRaydium && createdPool) {

                            const ammid = interactRaydium.accounts[4]
                            if (curAmmId === ammid.toString()) return
                            const baseToken = interactRaydium.accounts[8]
                            const quoteToken = interactRaydium.accounts[9]

                            const baseTokenInfo = await getMint(connection, baseToken);
                            const quoteTokenInfo = await getMint(connection, quoteToken);

                            const baseDecimal = baseTokenInfo.decimals;
                            const quoteDecimal = quoteTokenInfo.decimals;

                            const res = tx.meta.logMessages?.find(item => item.includes("InitializeInstruction2"));
                            const keyValuePairs = res.split(", ");

                            let pcAmount = null;
                            let coinAmount = null;
                            for (let i = 0; i < keyValuePairs.length; i++) {
                                const pair = keyValuePairs[i].split(": ");

                                if (pair[0] === "init_pc_amount") {
                                    pcAmount = parseInt(pair[1], 10); // Convert the value to an integer
                                } else if (pair[0] === "init_coin_amount") {
                                    coinAmount = parseInt(pair[1], 10); // Convert the value to an integer
                                }
                            }

                            initialPrice = pcAmount / (coinAmount * (10 ** (quoteDecimal - baseDecimal)))
                            const log = {
                                'Signature:': `https://solscan.io/tx/${tx.transaction.signatures}`,
                                'AMMID:': ammid.toString(),
                                'Base Mint:': baseToken.toString(),
                                'Quote Mint:': quoteToken.toString(),
                                'Base Decimal:': baseDecimal,
                                'Quote Decimal:': quoteDecimal,
                                'Starting Price:': `${initialPrice} SOL`,
                            }

                            console.log('\n# New Pool is created')
                            console.table(log)
                            const frozenToken: boolean = baseTokenInfo.freezeAuthority == null ? true : false;
                            console.log(`\n# Current token's Freeze Authority disabled state: ${frozenToken}`)
                            if (frozenToken === BotConfig.onlyFrozenToken) {
                                curToken = new Token(TOKEN_PROGRAM_ID, baseToken, baseDecimal)
                                curAmmId = ammid.toString()
                                if (curState === "None") {
                                    curState = "Bought"
                                    await buyToken(curToken, curAmmId)
                                    progressBar.start(initialPrice * 2, 0);
                                }
                            }
                        }
                    }
                }
                // if (curToken && curState === "Bought") {

                    const t = (tx.blockTime - curTime) / 1000
                    if (t > 5.0) {
                        console.log(`\n# It seems the stopping time now! Delay: ${t}s / ${maxDuration}s`)
                        // progressBar.stop()
                        // sellToken(curToken, curAmmId)
                    }
                // }
            });
        }

        if (curToken && curState === "Bought") {

            const walletInfs = await getWalletTokenAccount(connection, wallet.publicKey);
            const one = walletInfs.find(i => i.accountInfo.mint.toString() === curToken.mint.toString());
            if (one) {
                const curPrice = await getPrice(curToken.mint.toString());
                if (curPrice) {
                    // const curProfit = Number((curPrice * 100 / initialPrice).toFixed(3))
                    // console.log(`* TakeProfit: ${curProfit} %`);
                    progressBar.update(curPrice);
                    if (curPrice >= initialPrice * BotConfig.takeProfit || curPrice < initialPrice * BotConfig.loseProfit) {
                        curState = "Sold"
                        progressBar.stop()
                        sellToken(curToken, curAmmId)
                    }
                }
            }
        }
    } catch (e) {
        console.log(' *', e)
    }
    setTimeout(moniterWallet, BotConfig.intervalTime);
}

const buyToken = async (bt: Token, ammId: string) => {
    try {
        const res = await swap(DEFAULT_TOKEN.WSOL, bt, ammId, BotConfig.tokenSwapAmount * LAMPORTS_PER_SOL);
        const log = {
            'Signature:': `https://solscan.io/tx/${res}`,
            'Token Address:': bt.mint.toString(),
            'Spent:': `${BotConfig.tokenSwapAmount} SOL`
        }
        console.log(`\n# Buying new token`)
        console.table(log)
        const checkTxRes = async () => {
            const state = await connection.getSignatureStatus(res, { searchTransactionHistory: true });
            if (state && state.value) {
                console.log(`\n# checking buying transaction result ${state}`)
                if (state.value.err) {
                    console.log(`\n# Sending a transaction again to buy the token: ${bt.mint}`)
                    buyToken(bt, ammId)
                }
                else
                    setTimeout(checkTxRes, BotConfig.intervalTime);
            }
        }
    } catch (e) {
        console.log(`\n# Error while trying to buy token: ${bt.mint}, ${e}`)
        curState = "None"
    }
}

const sellToken = async (bt: Token, ammId: string) => {
    try {
        const walletInfs = await getWalletTokenAccount(connection, wallet.publicKey);
        const one = walletInfs.find(i => i.accountInfo.mint.toString() === bt.mint.toString());
        if (one) {
            const bal = one.accountInfo.amount
            if (Number(bal) > 1000) {
                const res = await swap(bt, DEFAULT_TOKEN.WSOL, ammId, Number(bal));
                const log = {
                    'Signature:': `https://solscan.io/tx/${res}`,
                    'Token Address:': bt.mint.toString(),
                    'Amount:': Number(bal).toString()
                }
                console.log(`\n# Selling the token`)
                console.table(log)

                const checkTxRes = async () => {
                    const state = await connection.getSignatureStatus(res, { searchTransactionHistory: true });
                    if (state && state.value) {
                        console.log(`\n# checking selling transaction result ${state}`)
                        if (state.value.err) {
                            console.log(`\n# Sending a transaction again to sell the token: ${bt.mint}`)
                            sellToken(bt, ammId)
                        }
                        else
                            setTimeout(checkTxRes, BotConfig.intervalTime);
                    }
                }
            }
        }
    } catch (e) {
        console.log(`\n# Error while trying to sell token: ${bt.mint}\n ${e}`)
        curState = "None"
    }
}

main();