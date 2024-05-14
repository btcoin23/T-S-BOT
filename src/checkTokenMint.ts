import { PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import { connection } from './config';

export const checkTokenMint = async (sig: string) => {
    const tx = await connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
    const isMinted: any = tx.transaction.message.instructions.find((item: any) =>
        item.parsed?.type === 'mintTo'
    )
    if (isMinted) {
        const newToken = isMinted.parsed.info.mint;
        const totalSupply = isMinted.parsed.info.amount;
        const newTokenInfo = await getMint(connection, new PublicKey(newToken));
        console.log(`# New token is minted: ${newToken}, Decimal: ${newTokenInfo.decimals.toString()}, Total Supply: ${totalSupply.toString()}`);
        return true;
    }
    return false;
}

const signature = '2sDAuuaYv51SXoUuKD9RprKM6yVY37y2WbRWqeiaFhqbxBqQnbP2qLQNVfpR9MyNvvEg1t3WuR469q4Eus9J4mbZ';
checkTokenMint(signature);