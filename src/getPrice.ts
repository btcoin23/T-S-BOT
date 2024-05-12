export const getPrice = async (tokenMint: string) => {

    const res: any = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`);
    const data = await res.json();
    const price = data.pairs.find((x: any) => x.priceNative).priceNative
    // console.log(`- Token: ${tokenMint}, Price: ${price}`);
    return Number(price);
}
// const token = 'CAUbsyj4t4KiU6SwxAiehkNZCzHfNWcSmu49tF8czsAW'
// getPrice(token);