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
exports.checkTokenMint = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const config_1 = require("./config");
const checkTokenMint = (sig) => __awaiter(void 0, void 0, void 0, function* () {
    const tx = yield config_1.Solana_Connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
    const isMinted = tx.transaction.message.instructions.find((item) => { var _a; return ((_a = item.parsed) === null || _a === void 0 ? void 0 : _a.type) === 'mintTo'; }); // minting transaction
    if (isMinted) {
        const newToken = isMinted.parsed.info.mint;
        const totalSupply = isMinted.parsed.info.amount;
        const newTokenInfo = yield (0, spl_token_1.getMint)(config_1.Solana_Connection, new web3_js_1.PublicKey(newToken));
        console.log(`# New token is minted: ${newToken}, Decimal: ${newTokenInfo.decimals.toString()}, Total Supply: ${totalSupply.toString()}`);
        return true;
    }
    return false;
});
exports.checkTokenMint = checkTokenMint;
// const signature = '5p8MGCDgJuyg5XqDxM6tysoxbifGzd9YvH1yPY9UptnKz3zBYgvvv7PYLz3qJ2ZtVGpjsSD6ypxCBFJZdaRmx6Mq';
// // const signature = '2fhRJQFWbq8aHD534gnCFksYLgH91XNKfi1KwziSs5wmhYxH9duXg7n4b4AgCaBoBZafwZhhbiMk5mYEFdeXx4mK';
// checkTokenMint(signature);
