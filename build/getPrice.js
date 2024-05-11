"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrice = void 0;
const getPrice = (tokenMint) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`);
    const data = yield res.json();
    const price = data.pairs.find((x) => x.priceNative).priceNative;
    console.log(`- Token: ${tokenMint}, Price: ${price}`);
    return price;
});
exports.getPrice = getPrice;
// const token = 'CAUbsyj4t4KiU6SwxAiehkNZCzHfNWcSmu49tF8czsAW'
// getPrice(token);
