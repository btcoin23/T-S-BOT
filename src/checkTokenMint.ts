import { PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import { Solana_Connection } from './config';

export const checkTokenMint = async (sig: string) => {
    const tx = await Solana_Connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
    const isMinted: any = tx.transaction.message.instructions.find((item: any) =>
        item.parsed?.type === 'mintTo'
    ) // minting transaction
    if (isMinted) {
        const newToken = isMinted.parsed.info.mint;
        const totalSupply = isMinted.parsed.info.amount;
        const newTokenInfo = await getMint(Solana_Connection, new PublicKey(newToken));
        console.log(`# New token is minted: ${newToken}, Decimal: ${newTokenInfo.decimals.toString()}, Total Supply: ${totalSupply.toString()}`);
        return true;
    }
    return false;
}

// const signature = '5p8MGCDgJuyg5XqDxM6tysoxbifGzd9YvH1yPY9UptnKz3zBYgvvv7PYLz3qJ2ZtVGpjsSD6ypxCBFJZdaRmx6Mq';
// // const signature = '2fhRJQFWbq8aHD534gnCFksYLgH91XNKfi1KwziSs5wmhYxH9duXg7n4b4AgCaBoBZafwZhhbiMk5mYEFdeXx4mK';
// checkTokenMint(signature);