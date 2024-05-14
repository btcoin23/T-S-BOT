import { PublicKey, LAMPORTS_PER_SOL, PartiallyDecodedInstruction } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import { RAYDIUM_PUBLIC_KEY, connection, BotConfig } from './config';
import { addToken, addWallet, getAllWallets } from './data';

export async function checkBalance(address: string) {
    try {
        const curAddressPubkey = new PublicKey(address)
        const balance = await connection.getBalance(curAddressPubkey);
        console.log(`Balance of ${address} is ${balance / LAMPORTS_PER_SOL} SOL`);
        return balance / LAMPORTS_PER_SOL;
    } catch (error) {
        console.error(`Error getting balance for ${address}: ${error}`);
    }
}

export async function moniterWallet(curAddress: string) {
    console.log(`---------- Checking wallet: ${curAddress} ... ----------`);
    const curAddressPubkey = new PublicKey(curAddress)
    let signatureInfo = await connection.getSignaturesForAddress(curAddressPubkey, {limit: 1});
    let lastSignature = signatureInfo[0].signature;

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
                    //check token transfer
                    const isTransferred: any = tx.transaction.message.instructions.find((item: any) =>
                        item.parsed?.type === 'transfer'
                    )
                    if (isTransferred) {
                        const txAmount = tx.meta.postBalances[0] - tx.meta.preBalances[0];
                        if (txAmount <= -BotConfig.threshold * LAMPORTS_PER_SOL) {
                            const sender = tx.transaction.message.accountKeys[0].pubkey.toString();
                            const recipient = tx.transaction.message.accountKeys[1].pubkey.toString();
                            console.log(`\n* Txid: ${tx.transaction.signatures} -> ${-txAmount / LAMPORTS_PER_SOL} SOL is transferred from ${sender} to ${recipient}`);
                            if(recipient !== curAddress)
                                {
                                    if(!getAllWallets().includes(recipient))
                                    {
                                        console.log(`\n---------- Detected new wallet: ${recipient} ----------`);
                                        moniterWallet(recipient);
                                        addWallet(recipient);
                                        // clearInterval(intervalWallet)
                                    }
                                }
                        }
                    }

                    //check new token mint
                    const isMinted: any = tx.transaction.message.instructions.find((item: any) =>
                        item.parsed?.type === 'mintTo'
                    )
                    if (isMinted) {
                        const newToken: string = isMinted.parsed.info.mint;
                        const amount: number = isMinted.parsed.info.amount;
                        const newTokenInfo = await getMint(connection, new PublicKey(newToken));
                        const decimal: number = newTokenInfo.decimals
                        console.log(`\n* Txid: ${tx.transaction.signatures} -> New token is minted: ${newToken}, Decimal: ${decimal}, Total Supply: ${amount}`);
                    }

                    //check new Pool information
                    console.log(tx.meta.logMessages?.find((item: string) =>item.includes('Create')))
                    const interactRaydium = tx.transaction.message.instructions.find((item: any) =>
                        item.programId.toString() === RAYDIUM_PUBLIC_KEY
                    ) as PartiallyDecodedInstruction
                    const createdPool = tx.meta.logMessages?.find((item: string) =>item.includes('Create'))
                    if (interactRaydium && createdPool) {

                        const ammid = interactRaydium.accounts[4]
                        const baseToken = interactRaydium.accounts[8]
                        const quoteToken = interactRaydium.accounts[9]

                        const baseTokenInfo = await getMint(connection, baseToken);
                        const quoteTokenInfo = await getMint(connection, quoteToken);

                        const baseDecimal = baseTokenInfo.decimals;
                        const quoteDecimal = quoteTokenInfo.decimals;

                        console.log(`\n* Txid: ${tx.transaction.signatures} -> New Pool is created`);
                        console.log(` - AMMID: ${ammid}`);
                        console.log(` - Base token: ${baseToken}, Decimal: ${baseDecimal.toString()}`);
                        console.log(` - Quote token: ${quoteToken}, Decimal: ${quoteDecimal.toString()}`);

                        addToken(baseToken.toString(), ammid.toString(), baseDecimal)
                    }                    
                })
            }
        } catch (error) {
            console.error(`* ${error}`);
        }
    }, BotConfig.intervalTime);
}

// // // The wallet address you want to monitor
// // // Start monitoring the specified address
// const monitoredAddress = new PublicKey('HzUjY1eHsGrwV1KrSqaLSkm48urhkExtok5cwz1rqD4');
// checkBalance(monitoredAddress);
// moniterWallet(monitoredAddress);