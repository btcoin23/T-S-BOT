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
exports.checkTxResult = void 0;
const config_1 = require("./config");
const checkTxResult = (sig) => __awaiter(void 0, void 0, void 0, function* () {
    const state = yield config_1.Solana_Connection.getSignatureStatus(sig, { searchTransactionHistory: true });
    if (state.value.err) {
        console.log(` - Transaction is failed: https://solscan.io/tx/${sig}`);
        return false;
    }
    else {
        console.log(` - Transaction is succeed: https://solscan.io/tx/${sig}`);
        return true;
    }
});
exports.checkTxResult = checkTxResult;
// const sig = 'QSYa6rwzTUsa85od1BEm6iEjLJpLc9bV2m6fJ7zJWKKe7smcnCRjZH62tCTEnFTF51EF2SduAvbh2YNvZ1yayzV'
// //const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=45d2a95e-937d-4802-8487-98dec2736fc9');
// checkTxResult(sig);
