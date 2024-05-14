import { PublicKey, LAMPORTS_PER_SOL, PartiallyDecodedInstruction } from '@solana/web3.js';
import { RAYDIUM_PUBLIC_KEY, connection, BotConfig } from './config';
import { getMint } from '@solana/spl-token';
import { addToken, addWallet, getAllWallets } from './data';
// import { addNewToken, addWallet } from './run';
// Function to check the balance of a given address
export async function checkBalance(address: PublicKey) {
    try {
        const balance = await connection.getBalance(address);
        console.log(`- Balance for ${address.toString()} is ${balance / LAMPORTS_PER_SOL} SOL`);
        return balance / LAMPORTS_PER_SOL;
    } catch (error) {
        console.error(` * Error getting balance for ${address.toString()}: ${error}`);
    }
}

// Function to monitor transactions of a given address
export async function moniterWallet(address: PublicKey) {
    // console.log(`---------- ---------- Checking transactions of wallet: ${address.toString()} ... ---------- ----------`);
    // let signatureInfo = await connection.getSignaturesForAddress(address, {limit: 1000});
    // let lastSignature = signatureInfo[0].signature;

    // setInterval(async () => {
    //     try {
    //         signatureInfo = await connection.getSignaturesForAddress(address, { until: lastSignature });
    //         // console.log(signatureInfo);
    //         if (signatureInfo.length > 0) {
                // console.log(`\n# ${signatureInfo.length.toString()} transactions are found at ${address.toString()}`);
                // lastSignature = signatureInfo[0].signature;
                // const sigArray = signatureInfo.filter(sig => !sig.err).map(sig => sig.signature);
                const sigArray = ['JcVin1PEUJ4hz8wJoqPEaeR3P6yCmxe6VDxZVDWfBfdTwFnsyvS5VKfrHKQ2SJFTFgsLP2ox58GovzMq36Hj3aJ']//, '5JPHgcGagD8RVVsCf67cZNTZcfDkVRKRBKCxb7Rr7MCwqutwmBf1fbNWpQYWt6NnuzcP2DDEsjKhBg6aJc7E1SCx', '2fhRJQFWbq8aHD534gnCFksYLgH91XNKfi1KwziSs5wmhYxH9duXg7n4b4AgCaBoBZafwZhhbiMk5mYEFdeXx4mK', '58zUW5C41nyhccuse3CBVshybJr3adbag1sfupm2boKaydopRZJxphZCSfxGGCijxaosZjHHMXaGgQa3Cyoggyg']
                // // const sigArray = ['5JPHgcGagD8RVVsCf67cZNTZcfDkVRKRBKCxb7Rr7MCwqutwmBf1fbNWpQYWt6NnuzcP2DDEsjKhBg6aJc7E1SCx', '2fhRJQFWbq8aHD534gnCFksYLgH91XNKfi1KwziSs5wmhYxH9duXg7n4b4AgCaBoBZafwZhhbiMk5mYEFdeXx4mK', '58zUW5C41nyhccuse3CBVshybJr3adbag1sfupm2boKaydopRZJxphZCSfxGGCijxaosZjHHMXaGgQa3Cyoggyg']
                const trxs = await connection.getParsedTransactions(sigArray, { maxSupportedTransactionVersion: 0 });
                // // console.log(trxs.length.toString())
                const txs = trxs.filter(trx => trx?.transaction)
                // console.log(trxs);
                txs.forEach(async (tx, index) => {
                //     // console.log(`\nTransaction ${index}: ${tx.transaction.signatures}`);

                //     //check token transfer
                    const isTransferred: any = tx.transaction.message.instructions.find((item: any) =>
                        item.parsed?.type === 'transfer'
                    )
                    if (isTransferred) {
                        const txAmount = tx.meta.postBalances[0] - tx.meta.preBalances[0];
                        if (txAmount >= -BotConfig.threshold * LAMPORTS_PER_SOL) {
                            const recipientPublicKey = tx.transaction.message.accountKeys[0].pubkey;
                            console.log(`\n * Over ${BotConfig.threshold} SOL transition is detected: ${tx.transaction.signatures}`);
                            console.log(` - Recipient Address: ${recipientPublicKey}`);
                            console.log(` - Amount: ${-txAmount / LAMPORTS_PER_SOL} SOL`);

                            // if(recipientPublicKey.toString() !== address.toString())
                            //     {
                            //         if(!getAllWallets().includes(recipientPublicKey.toString()))
                            //         {
                            //             console.log(`---------- ---------- ---------- Detected new wallet: ${recipientPublicKey.toString()}... ---------- ---------- ----------`);
                            //             moniterWallet(recipientPublicKey);
                            //             addWallet(recipientPublicKey.toString());
                            //         }
                            //     }
                        }
                    }

                //     //check new token mint
                //     const isMinted: any = tx.transaction.message.instructions.find((item: any) =>
                //         item.parsed?.type === 'mintTo'
                //     )
                //     if (isMinted) {
                //         const newToken = isMinted.parsed.info.mint;
                //         const totalSupply = isMinted.parsed.info.amount;
                //         const newTokenInfo = await getMint(connection, new PublicKey(newToken));
                //         console.log(`\n * New token is minted: ${newToken}, Decimal: ${newTokenInfo.decimals.toString()}, Total Supply: ${totalSupply.toString()} from ${tx.transaction.signatures}`);
                //     }

                console.log(tx.meta.logMessages?.find((item: string) =>item.includes('Create')))
                //     //check new Pool information
                    const createdPool = tx.transaction.message.instructions.find((item: any) =>
                        item.programId.toString() === RAYDIUM_PUBLIC_KEY
                    ) as PartiallyDecodedInstruction
                    if (createdPool) {
                        console.log('created new pool--------------------------');
                        console.log(createdPool.accounts[4]);
                    // }
                        const ammId = createdPool.accounts[4]
                        const baseToken = createdPool.accounts[8]
                        const quoteToken = createdPool.accounts[9]

                        const baseTokenInfo = await getMint(connection, baseToken);
                        const quoteTokenInfo = await getMint(connection, quoteToken);

                        const baseDecimal = baseTokenInfo.decimals;
                        const quoteDecimal = quoteTokenInfo.decimals;

                        console.log(`\n * New Pool is created from ${tx.transaction.signatures}`);
                        console.log(` - Base token: ${baseToken}, ${baseDecimal.toString()}`);
                        console.log(` - Quote token: ${quoteToken}, ${quoteDecimal.toString()}`);

                        // addToken(baseToken.toString(), ammId.toString(), baseDecimal)
                    }                    
                })
            // }
    //     } catch (error) {
    //         console.error(` * Error monitoring transactions for ${address.toString()}: ${error}`);
    //     }
    // }, IntervalTime);
}

// // // The wallet address you want to monitor
// // // Start monitoring the specified address
// const sig = '5JPHgcGagD8RVVsCf67cZNTZcfDkVRKRBKCxb7Rr7MCwqutwmBf1fbNWpQYWt6NnuzcP2DDEsjKhBg6aJc7E1SCx'
// const monitoredAddress = new PublicKey('Gn9xi6m8327FkvF8exmJhK49Jn1vMKbefpRrAazrNPfr');
// checkBalance(monitoredAddress);
// moniterWallet(monitoredAddress);