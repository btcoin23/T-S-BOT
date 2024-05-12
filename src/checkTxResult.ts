import { Solana_Connection } from "./config";

export const checkTxResult = async (sig: string) => {
    const state = await Solana_Connection.getSignatureStatus(sig, { searchTransactionHistory: true });
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
// const sig = '5C4mWsrkqjTbLqsCRPWvxTm8aHcdr5gFSQ8vGjiZ6RP5a81e36hhMzGUqUKBfCE3edjLcMjFT3WpcoqZdb5F7oMq'
// const sig = '5tb3Jd6quqc42f5E2fbQzEAiT2i8LyYjzPeuootbYNsFRGQbJGf7rpvhcVaErLGjkTwQL26AgvRbXzcomzhHMaTW'
// checkTxResult(sig);