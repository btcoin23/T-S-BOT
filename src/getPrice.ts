export const getPrice = async (tokenMint: string) => {
    try {
        const res: any = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`);
        const data = await res.json();
        const price = data.pairs.find((x: any) => x.priceNative).priceNative
        // console.log(`- Token: ${tokenMint}, Price: ${price}`);
        return Number(price);
    }
    catch (e) {
        await getPrice(tokenMint);
    }
}
// const token = 'S1XDJzrr2F5YkfCWeE8i52aySgE8XbyAHn3V5435rKz'
// getPrice(token);
