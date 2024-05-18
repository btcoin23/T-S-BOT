import { PublicKey } from '@solana/web3.js'
import { connection } from "./config";

export const checkTxResult = async (sig: string) => {
    const state = await connection.getSignatureStatus(sig, { searchTransactionHistory: true });
    console.log(state)
    if (state.value.err) {
        console.log(` - Transaction is failed: https://solscan.io/tx/${sig}`);
        return false;
    }
    else {
        console.log(` - Transaction is succeed: https://solscan.io/tx/${sig}`);
        return true;
    }
}

// // //const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=45d2a95e-937d-4802-8487-98dec2736fc9');
// const sig = '4H2Ueo33Cqu9mSngRZSnF2114DCUFHGNDnj3BxvZZAQqE9CPDmnmeNKZjNJNfbYAFfBrUH6oU6JF2G8NpN2ZrKR9'
// const sig = '5tb3Jd6quqc42f5E2fbQzEAiT2i8LyYjzPeuootbYNsFRGQbJGf7rpvhcVaErLGjkTwQL26AgvRbXzcomzhHMaTW'
// checkTxResult(sig);

// const sleep = (ms:number) => {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }