import { PartiallyDecodedInstruction } from '@solana/web3.js';
import { RAYDIUM_PUBLIC_KEY, connection } from './config';
import { getMint } from '@solana/spl-token';
export const checkNewPool = async (sig: any) => {
    const tx = await connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
    const createdPool = tx.transaction.message.instructions.find((item: any) =>
        item.programId.toString() === RAYDIUM_PUBLIC_KEY
    ) as PartiallyDecodedInstruction
    if (createdPool) {
        const ammid = createdPool.accounts[4]
        const baseToken = createdPool.accounts[8]
        const quoteToken = createdPool.accounts[9]

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

const signature = '4GQVoKwZke1ohVb6tV6pXL7uAYX1DpWPu8YZhTjVtg4KDXsEbFVpBtSpQXHxwj9csniApUjeYLuvAvn4Ykgc3pUk';
// const signature = '2fhRJQFWbq8aHD534gnCFksYLgH91XNKfi1KwziSs5wmhYxH9duXg7n4b4AgCaBoBZafwZhhbiMk5mYEFdeXx4mK';
checkNewPool(signature);