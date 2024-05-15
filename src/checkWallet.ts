import { TokenAccount } from '@raydium-io/raydium-sdk';
import { connection, wallet } from './config';
import { getWalletTokenAccount } from './util';
async function test(){
    //wallet balance test
    // connection.onSignature('signature', async(signatureResult: any)={
        // console.log('here');
    // });
    // const tokenMint = 'c8ZW1tFUbCRE8tSCawSU1AEi2jGBCaxEF5EnA6hokPH'
    // const walletTokenInfs = await getWalletTokenAccount(connection, wallet.publicKey);
    // // console.log(walletTokenInfs)
    // const acc = walletTokenInfs.find((account: TokenAccount) => account.accountInfo.mint.toString() === tokenMint);
    // const bal = acc.accountInfo.amount
    // console.log(acc)


    //transfer test

    // const sig = '33EB3GWTUUAQdojdkUaAAyBHtE55CjCaqhcg4Kw7V7yHX2xKprmJYi1fUcnaaqFeW7SsF7FgNhdBQbDkxftDJ9MP'
    // const trxs = await connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
    // const isTransferred: any = trxs.transaction.message.instructions.find((item: any) =>
    //     item.parsed?.type === 'transfer'
    // )
    // console.log(isTransferred)

}

// test()
