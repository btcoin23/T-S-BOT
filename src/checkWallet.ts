import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { connection, BotConfig } from './config';

const moniterWallet = (trackWallet: string) => {
    const WALLET_TRACK = new PublicKey(trackWallet)
    const subscriptionId = connection.onAccountChange(
        WALLET_TRACK,
        (updatedAccountInfo) =>
            console.log(`---Event Notification for ${trackWallet}--- \nNew Account :`, updatedAccountInfo.data.byteOffset),
        "confirmed"
    );
}

moniterWallet(BotConfig.trackWallet);