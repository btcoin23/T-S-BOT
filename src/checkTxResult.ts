import { Solana_Connection } from "./config";

export const checkTxResult = async (sig: string) => {
    const state = await Solana_Connection.getSignatureStatus(sig, { searchTransactionHistory: true });
    if (state.value.err) {
        console.log(` - Transaction is failed: https://solscan.io/tx/${sig}`);
        return false;
    }
    else {
        console.log(` - Transaction is succeed: https://solscan.io/tx/${sig}`);
        return true;
    }
}


// const sig = 'QSYa6rwzTUsa85od1BEm6iEjLJpLc9bV2m6fJ7zJWKKe7smcnCRjZH62tCTEnFTF51EF2SduAvbh2YNvZ1yayzV'
// //const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=45d2a95e-937d-4802-8487-98dec2736fc9');
// checkTxResult(sig);