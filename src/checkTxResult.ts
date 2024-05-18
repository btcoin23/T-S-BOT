import { PublicKey } from '@solana/web3.js'
import { connection } from "./config";

export const checkTxResult = async (wal: string) => {
    const curWallet = new PublicKey('4iJVCJNe4waVA5U7Miyhm7XKyahd32pDRB7LmamfLXTf')
    const signatureInfo = await connection.getSignaturesForAddress(new PublicKey(wal), { limit: 10 });
    const sigs = signatureInfo.filter(sig => !sig.err).map(sig => sig?.signature);
    const txns = await connection.getParsedTransactions(sigs, { maxSupportedTransactionVersion: 0 });
    const lastSignature = txns.find(tr => tr.transaction.message.accountKeys[0].pubkey.toString() === curWallet.toString()).transaction.signatures[0]
    console.log(lastSignature)
}

// // //const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=45d2a95e-937d-4802-8487-98dec2736fc9');
// const sig = '4H2Ueo33Cqu9mSngRZSnF2114DCUFHGNDnj3BxvZZAQqE9CPDmnmeNKZjNJNfbYAFfBrUH6oU6JF2G8NpN2ZrKR9'
const sig = 'FjEKhdhqskSHUgkTxuDA55WoynHx6UyCxxS7caX1QXJi'
checkTxResult(sig);

// const sleep = (ms:number) => {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }