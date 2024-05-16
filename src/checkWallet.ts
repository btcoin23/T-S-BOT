import { TOKEN_PROGRAM_ID, Token } from "@raydium-io/raydium-sdk";
import { PublicKey, LAMPORTS_PER_SOL, PartiallyDecodedInstruction } from '@solana/web3.js'
import { getMint } from '@solana/spl-token';
import { swap } from './swapAmm';
import { connection, wallet, BotConfig, RAYDIUM_PUBLIC_KEY, DEFAULT_TOKEN } from './config';
import { getWalletTokenAccount } from './util';

const moniterWallet = async (curWallet: string) => {
    console.log(`---------- Checking wallet: ${curWallet} ... ----------`);
    const curAddressPubkey = new PublicKey(curWallet)
    let signatureInfo = await connection.getSignaturesForAddress(curAddressPubkey, { limit: 1 });
    let lastSignature = signatureInfo[0].signature;
    let initialPrice: number;
    let curAmmId: string;
    let curToken: Token;
    const intervalWallet = setInterval(async () => {
        try {
            signatureInfo = await connection.getSignaturesForAddress(curAddressPubkey, { until: lastSignature });
            if (signatureInfo.length > 0) {
                // console.log(`# ${signatureInfo.length} transactions are found at ${curAddress}`);
                lastSignature = signatureInfo[0].signature;
                const sigArray = signatureInfo.filter(sig => !sig.err).map(sig => sig.signature);
                const trxs = await connection.getParsedTransactions(sigArray, { maxSupportedTransactionVersion: 0 });
                const txs = trxs.filter(trx => trx?.transaction)
                txs.forEach(async (tx) => {
                    //check new token mint
                    const isMinted: any = tx.transaction.message.instructions.find((item: any) =>
                        item.parsed?.type === 'mintTo'
                    )
                    if (isMinted) {
                        const tokenMint: string = isMinted.parsed.info.mint;
                        const amount: number = isMinted.parsed.info.amount;
                        // const tokenMintInfo = await getMint(connection, new PublicKey(tokenMint));
                        // const decimal: number = tokenMintInfo.decimals
                        console.log(`\n* Txid: ${tx.transaction.signatures} -> New token is minted: ${tokenMint}, Amount: ${amount}`)//,  Decimal: ${decimal}`);
                        if(tokenMint === curToken?.mint.toString()){
                            sellToken(curToken, curAmmId)
                        }
                    } else {
                        const isTransferred: any = tx.transaction.message.instructions.find((item: any) =>
                            item.parsed?.type === 'transfer'
                        )
                        if (isTransferred) {
                            const txAmount = tx.meta.postBalances[0] - tx.meta.preBalances[0];
                            // if(txAmount <= - LAMPORTS_PER_SOL) console.log('Transferred over 1 Sol')
                            if (txAmount <= -BotConfig.threshold * LAMPORTS_PER_SOL) {
                                const sender = tx.transaction.message.accountKeys[0].pubkey.toString();
                                const recipient = tx.transaction.message.accountKeys[1].pubkey.toString();
                                console.log(`\n* Txid: ${tx.transaction.signatures} -> ${-txAmount / LAMPORTS_PER_SOL} SOL is transferred from ${sender} to ${recipient}`);
                                if (recipient !== curWallet) {
                                        console.log(`\n---------- Detected new wallet: ${recipient} ----------`);
                                        moniterWallet(recipient);
                                        clearInterval(intervalWallet);
                                }
                            }
                        } else {
                            //check new Pool information
                            const interactRaydium = tx.transaction.message.instructions.find((item: any) =>
                                item.programId.toString() === RAYDIUM_PUBLIC_KEY
                            ) as PartiallyDecodedInstruction
                            const createdPool = tx.meta.logMessages?.find((item: string) => item.includes('Create'))
                            if (interactRaydium && createdPool) {

                                const ammid = interactRaydium.accounts[4]
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
                                console.log(`\n* Txid: ${tx.transaction.signatures} -> New Pool is created`);
                                console.log(` - AMMID: ${ammid}`);
                                console.log(` - Base token: ${baseToken}, Decimal: ${baseDecimal.toString()}, StartingPrice: ${initialPrice}`);
                                console.log(` - Quote token: ${quoteToken}, Decimal: ${quoteDecimal.toString()}`);

                                curToken = new Token(TOKEN_PROGRAM_ID, new PublicKey(baseToken), baseDecimal)
                                curAmmId = ammid.toString()
                                buyToken(curToken, curAmmId)
                            }
                        }
                    }


                })
            }
        }catch(e){
            console.log(e)
        }
        
    }, BotConfig.intervalTime);
}

const buyToken = async (bt: Token, ammId: string) => {

    const res = await swap(DEFAULT_TOKEN.WSOL, bt, ammId, BotConfig.tokenSwapAmount * LAMPORTS_PER_SOL);
    console.log(`\n* Bought new token: ${bt.mint} https://solscan.io/tx/${res}`);
    setTimeout(async () => {
        const walletInfs = await getWalletTokenAccount(connection, wallet.publicKey);
        const one = walletInfs.find(i => i.accountInfo.mint.toString() === bt.mint.toString());
        if (!one) {
            buyToken(bt, ammId)
        }
    }, 1000 * 60);
}

const sellToken = async(bt: Token, ammId: string) => {
    const walletInfs = await getWalletTokenAccount(connection, wallet.publicKey);
    const one = walletInfs.find(i => i.accountInfo.mint.toString() === bt.mint.toString());
    if(one){
        const bal = one.accountInfo.amount
        if(Number(bal) > 1000){
            const res = await swap(bt, DEFAULT_TOKEN.WSOL, ammId, Number(bal));
            console.log(`\n* Sold new Token: ${bt.mint} https://solscan.io/tx/${res}`);
        }
    }
    setTimeout(() => {
        sellToken(bt, ammId)
    }, 1000 * 60);
}

moniterWallet(BotConfig.trackWallet);