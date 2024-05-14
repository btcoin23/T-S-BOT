import { get } from "http";

export const getPrice = async (tokenMint: string) => {

    try {
        const res: any = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`);
        const data = await res.json();
        const price = data.pairs.find((x: any) => x.priceNative).priceNative
        // console.log(`- Token: ${tokenMint}, Price: ${price}`);
        return Number(price);
    }
    catch (e) {
        getPrice(tokenMint);
    }
}
// const token = 'hvgcKed9sugm6oxwN27UzxXzxzRtLbVtNS78HSE6wjS'
// getPrice(token);