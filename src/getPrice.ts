export const getPrice = async (tokenMint: string) => {
    try {
        const res: any = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`);
        const data = await res.json();
        const price = data.pairs.find((x: any) => x.priceNative).priceNative
        console.log(`- Token: ${tokenMint}, Price: ${price}`);
        return Number(price);
    }
    catch (e) {
        await getPrice(tokenMint);
    }
}
const token = 'Wp5w6KmJHdBpLqzJXfUqV3ddPxt1XLSTv3rimcPi1Lz'
getPrice(token);
