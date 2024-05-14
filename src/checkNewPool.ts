import { PartiallyDecodedInstruction } from '@solana/web3.js';
import { RAYDIUM_PUBLIC_KEY, connection } from './config';
import { getMint } from '@solana/spl-token';
export const checkNewPool = async (sig: any) => {
    const tx = await connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
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

    }                    
}

// const signature = '4GQVoKwZke1ohVb6tV6pXL7uAYX1DpWPu8YZhTjVtg4KDXsEbFVpBtSpQXHxwj9csniApUjeYLuvAvn4Ykgc3pUk';
// const signature = '2fhRJQFWbq8aHD534gnCFksYLgH91XNKfi1KwziSs5wmhYxH9duXg7n4b4AgCaBoBZafwZhhbiMk5mYEFdeXx4mK';
const signature = '4ysuVUNkGWuJaayMcnkP1Bhb7TkhYpNAQ6CBALWjF7Qhk3qMMWhJqcqHR6mJxSBjxmn7MHtEUyenbduJuN2K1Rav';
checkNewPool(signature);