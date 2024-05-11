import { PartiallyDecodedInstruction } from '@solana/web3.js';
import { RAYDIUM_PUBLIC_KEY, Solana_Connection } from './config';
// import { getMint } from '@solana/spl-token';
export const checkNewPool = async (sig: any) => {
    const tx = await Solana_Connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
    const res = tx.transaction.message.instructions.find((item: any) =>
        item.programId.toString() === RAYDIUM_PUBLIC_KEY
    ) as PartiallyDecodedInstruction // creating new pool transaction

    if (res) {
        const baseToken = res.accounts[8] // Zuzu
        const quoteToken = res.accounts[9] // SOL

        // const baseTokenInfo = await getMint(connection, baseToken);
        // const quoteTokenInfo = await getMint(connection, quoteToken);

        console.log(' - New Pool is founded');
        console.log(` - Base token: ${baseToken}`);//, ${baseTokenInfo.decimals.toString()}`);
        console.log(` - Quote token: ${quoteToken}`);//, ${quoteTokenInfo.decimals.toString()}`);
        return { baseToken, quoteToken }
    }
}

// // const signature = '2LYj8UPwfJPsfL7Ds7sL6dZTLpHuog9buQSeJBqqPPWnpu1kPKkn8x7WwwwThx5FTw99KtY3pVod27Y1ahAkGqTv';
// const signature = '2fhRJQFWbq8aHD534gnCFksYLgH91XNKfi1KwziSs5wmhYxH9duXg7n4b4AgCaBoBZafwZhhbiMk5mYEFdeXx4mK';
// checkNewPool(signature);