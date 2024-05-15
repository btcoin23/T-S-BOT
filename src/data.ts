import { BotConfig } from "./config";
import { getPrice } from "./getPrice";

type NewTokenInf = {
    Mint: string;
    AMMID: string;
    Decimal: number;
    Price: number;
    Status: string;
}

let allWallets: string[] = [];
let allTokens: NewTokenInf[] = [];

export const initWallets = () => {
    BotConfig.trackWallets.forEach(w => allWallets.push(w));
}

export function addWallet(w: string) {
    if (!allWallets.includes(w))
        allWallets.push(w);
}

export function removeWallet(w: string) {
    allWallets = allWallets.filter(x => x !== w);
}

export function getAllWallets() {
    return allWallets;
}

export function addToken(t: string, ammId: string, d: number, price: number) {
    const res = allTokens.find(x => x.Mint === t)
    if (!res)
        allTokens.push({ Mint: t, AMMID: ammId, Decimal: d, Price: price, Status: "None" });
}

export function removeToken(t: string) {
    allTokens = allTokens.filter(x => x.Mint !== t);
}

export function setTokenStatus(t: string, s: string) {
    allTokens.find(x => x.Mint === t).Status = s;
}

export async function updateTokenPrice(t: string) {
    const price = await getPrice(t)
    console.log(`Initial price: ${price}`)
    allTokens.find(x => x.Mint === t).Price = price;
}

export function updatedTokenStatus2sell(t: string) {
    allTokens.find(x => x.Mint === t && x.Status ==="Bought").Status = "Have2sell";
}

export function getAllTokens() {
    return allTokens;
}
