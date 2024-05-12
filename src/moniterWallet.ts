import { getMint } from '@solana/spl-token';
import { PublicKey, LAMPORTS_PER_SOL, PartiallyDecodedInstruction } from '@solana/web3.js';
import { RAYDIUM_PUBLIC_KEY, Solana_Connection, ThresholdAmount, IntervalTime } from './config';
import { addNewToken, addWallet, getWallets } from './data';
// import { addNewToken, addWallet } from './run';
// Function to check the balance of a given address
export async function checkBalance(address: PublicKey) {
    try {
        const balance = await Solana_Connection.getBalance(address);
        console.log(`- Balance for ${address.toString()} is ${balance / LAMPORTS_PER_SOL} SOL`);
        return balance / LAMPORTS_PER_SOL;
    } catch (error) {
        console.error(` * Error getting balance for ${address.toString()}: ${error}`);
    }
}

// Function to monitor transactions of a given address
export async function moniterWallet(address: PublicKey) {
    console.log(`---------- ---------- ---------- Checking transactions of wallet: ${address.toString()}... ---------- ---------- ----------`);
    let signatureInfo = await Solana_Connection.getSignaturesForAddress(address, {limit: 1});
    let lastSignature = signatureInfo[0].signature;

    setInterval(async () => {
        try {
            signatureInfo = await Solana_Connection.getSignaturesForAddress(address, { until: lastSignature });
            // console.log(signatureInfo);
            if (signatureInfo.length > 0) {
                console.log(`\n# ${signatureInfo.length.toString()} transactions are found at ${address.toString()}`);
                lastSignature = signatureInfo[0].signature;
                const sigArray = signatureInfo.filter(sig => !sig.err).map(sig => sig.signature);
                const trxs = await Solana_Connection.getParsedTransactions(sigArray, { maxSupportedTransactionVersion: 0 });
                const txs = trxs.filter(trx => trx.transaction)
                txs.forEach(async (tx, index) => {
                    console.log(`\nTransaction ${index}: ${tx.transaction.signatures}`);

                    //check token transfer
                    const isTransferred: any = tx.transaction.message.instructions.find((item: any) =>
                        item.parsed?.type === 'transfer'
                    )
                    if (isTransferred) {
                        const txAmount = tx.meta.postBalances[0] - tx.meta.preBalances[0];
                        if (txAmount <= -ThresholdAmount * LAMPORTS_PER_SOL) {
                            const recipientPublicKey = tx.transaction.message.accountKeys[1].pubkey;
                            console.log(` - Over ${ThresholdAmount} SOL transition is detected`);
                            console.log(` - Recipient Address: ${recipientPublicKey}`);
                            console.log(` - Amount: ${-txAmount / LAMPORTS_PER_SOL} SOL`);

                            if(recipientPublicKey.toString() !== address.toString())
                                {
                                    if(!getWallets().includes(recipientPublicKey.toString()))
                                    {
                                        console.log(`---------- ---------- ---------- Detected new wallet: ${recipientPublicKey.toString()}... ---------- ---------- ----------`);
                                        moniterWallet(recipientPublicKey);
                                        addWallet(recipientPublicKey.toString());
                                    }
                                }
                        }
                    }

                    //check new token mint
                    const isMinted: any = tx.transaction.message.instructions.find((item: any) =>
                        item.parsed?.type === 'mintTo'
                    )
                    if (isMinted) {
                        const newToken = isMinted.parsed.info.mint;
                        const totalSupply = isMinted.parsed.info.amount;
                        const newTokenInfo = await getMint(Solana_Connection, new PublicKey(newToken));
                        console.log(`\n# New token is minted: ${newToken}, Decimal: ${newTokenInfo.decimals.toString()}, Total Supply: ${totalSupply.toString()}`);
                    }

                    //check new Pool information
                    const createdPool = tx.transaction.message.instructions.find((item: any) =>
                        item.programId.toString() === RAYDIUM_PUBLIC_KEY
                    ) as PartiallyDecodedInstruction
                    if (createdPool) {
                        const baseToken = createdPool.accounts[8]
                        const quoteToken = createdPool.accounts[9]

                        const baseTokenInfo = await getMint(Solana_Connection, baseToken);
                        const quoteTokenInfo = await getMint(Solana_Connection, quoteToken);

                        const baseDecimal = baseTokenInfo.decimals;
                        const quoteDecimal = quoteTokenInfo.decimals;

                        console.log('\n# New Pool is created');
                        console.log(` - Base token: ${baseToken}, ${baseDecimal.toString()}`);
                        console.log(` - Quote token: ${quoteToken}, ${quoteDecimal.toString()}`);

                        addNewToken(baseToken.toString(), baseDecimal)
                    }                    
                })
            }
        } catch (error) {
            console.error(` * Error monitoring transactions for ${address.toString()}: ${error}`);
        }
    }, IntervalTime);
}

// // // The wallet address you want to monitor
// // // Start monitoring the specified address
// const monitoredAddress = new PublicKey('HzUjY1eHsGrwV1KrSqaLSkm48urhkExtok5cwz1rqD4');
// checkBalance(monitoredAddress);
// moniterWallet(monitoredAddress);