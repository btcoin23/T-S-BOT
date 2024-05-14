import { TokenAccount } from '@raydium-io/raydium-sdk';
import { connection, wallet } from './config';
import { getWalletTokenAccount } from './util';
async function test(){
    const tokenMint = 'c8ZW1tFUbCRE8tSCawSU1AEi2jGBCaxEF5EnA6hokPH'
    const walletTokenInfs = await getWalletTokenAccount(connection, wallet.publicKey);
    // console.log(walletTokenInfs)
    const acc = walletTokenInfs.find((account: TokenAccount) => account.accountInfo.mint.toString() === tokenMint);
    const bal = acc.accountInfo.amount
    console.log(acc)
}

test()