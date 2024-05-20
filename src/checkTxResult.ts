import { PublicKey } from '@solana/web3.js'
import { connection } from "./config";

export const checkTxResult = async (sig: string) => {
    const state = await connection.getSignatureStatus(sig, { searchTransactionHistory: true });
    console.log(state)
    if (state && state.value) {
        if (state.value.err) {
            console.log(`\n# Transaction failed!`)
        } else {
            console.log('\n# Transaction succeeded!')
        }
    }else{
        console.log('Not confirmed yet')
    }
}

// // //const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=45d2a95e-937d-4802-8487-98dec2736fc9');
// const sig = '4H2Ueo33Cqu9mSngRZSnF2114DCUFHGNDnj3BxvZZAQqE9CPDmnmeNKZjNJNfbYAFfBrUH6oU6JF2G8NpN2ZrKR9'
const sig = '5W4hWYxSF6Jjf4o9bcPoMo9KAdtsSvNAfxB2s6hXCenGTZ3R4zoHtg3a33Tfw81mctXeAfZnx5DmoiPRLpVM4xn'
checkTxResult(sig);

// const sleep = (ms:number) => {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }