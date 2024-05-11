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
exports.checkNewPool = void 0;
const config_1 = require("./config");
// import { getMint } from '@solana/spl-token';
const checkNewPool = (sig) => __awaiter(void 0, void 0, void 0, function* () {
    const tx = yield config_1.Solana_Connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
    const res = tx.transaction.message.instructions.find((item) => item.programId.toBase58() === config_1.RAYDIUM_PUBLIC_KEY); // creating new pool transaction
    if (res) {
        const baseToken = res.accounts[8]; // Zuzu
        const quoteToken = res.accounts[9]; // SOL
        // const baseTokenInfo = await getMint(connection, baseToken);
        // const quoteTokenInfo = await getMint(connection, quoteToken);
        console.log(' - New Pool is founded');
        console.log(` - Base token: ${baseToken}`); //, ${baseTokenInfo.decimals.toString()}`);
        console.log(` - Quote token: ${quoteToken}`); //, ${quoteTokenInfo.decimals.toString()}`);
        return { baseToken, quoteToken };
    }
});
exports.checkNewPool = checkNewPool;
// // const signature = '2LYj8UPwfJPsfL7Ds7sL6dZTLpHuog9buQSeJBqqPPWnpu1kPKkn8x7WwwwThx5FTw99KtY3pVod27Y1ahAkGqTv';
// const signature = '2fhRJQFWbq8aHD534gnCFksYLgH91XNKfi1KwziSs5wmhYxH9duXg7n4b4AgCaBoBZafwZhhbiMk5mYEFdeXx4mK';
// checkNewPool(signature);
