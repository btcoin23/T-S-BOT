import { TrackWallets } from "./config";
import { getPrice } from "./getPrice";

type NewTokenInf = {
    Mint: string;
    Decimal: number;
    Price: number;
    Bought: boolean;
}

let wallets: string[] = [];
let newTokens: NewTokenInf[] = [];

export const initializeWallets = () => {
    TrackWallets.forEach(wal => wallets.push(wal));
}

export function addWallet(wallet: string) {
    if (!wallets.includes(wallet))
        wallets.push(wallet);
}

export function removeWallet(wallet: string) {
    wallets = wallets.filter(x => x !== wallet);
}

export function getWallets() {
    return wallets;
}

export async function addNewToken(baseToken: string, decimal: number) {
    const res = newTokens.find(x => x.Mint === baseToken)
    if (!res) {
        const price = await getPrice(baseToken)
        newTokens.push({ Mint: baseToken, Decimal: decimal,  Price: price, Bought: false });
    }
}

export function removeNewToken(baseToken: string) {
    newTokens = newTokens.filter(x => x.Mint !== baseToken);
}

export function setBoughtToken(baseToken: string) {
    newTokens.find(x => x.Mint === baseToken).Bought = true;
}

export function getNewTokens() {
    return newTokens;
}
