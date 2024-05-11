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
exports.moniterWallet = exports.checkBalance = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const config_1 = require("./config");
const data_1 = require("./data");
// import { addNewToken, addWallet } from './run';
// Function to check the balance of a given address
function checkBalance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const balance = yield config_1.Solana_Connection.getBalance(address);
            console.log(`- Balance for ${address.toBase58()} is ${balance / web3_js_1.LAMPORTS_PER_SOL} SOL`);
            return balance / web3_js_1.LAMPORTS_PER_SOL;
        }
        catch (error) {
            console.error(` * Error getting balance for ${address.toBase58()}: ${error}`);
        }
    });
}
exports.checkBalance = checkBalance;
// Function to monitor transactions of a given address
function moniterWallet(address) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`---------- ---------- ---------- Checking transactions of wallet: ${address.toBase58()}... ---------- ---------- ----------`);
        let signatureInfo = yield config_1.Solana_Connection.getSignaturesForAddress(address);
        let lastSignature = signatureInfo[0].signature;
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            try {
                signatureInfo = yield config_1.Solana_Connection.getSignaturesForAddress(address, { until: lastSignature });
                // console.log(signatureInfo);
                if (signatureInfo.length > 0) {
                    console.log(`\n# ${signatureInfo.length.toString()} transactions are found at ${address.toBase58()}`);
                    lastSignature = signatureInfo[0].signature;
                    const sigArray = signatureInfo.filter(sig => !sig.err).map(sig => sig.signature);
                    const txs = yield config_1.Solana_Connection.getParsedTransactions(sigArray, { maxSupportedTransactionVersion: 0 });
                    txs.forEach((tx, index) => __awaiter(this, void 0, void 0, function* () {
                        console.log(`\nTransaction ${index}: ${tx.transaction.signatures}`);
                        //check token transfer
                        const isTransferred = tx.transaction.message.instructions.find((item) => { var _a; return ((_a = item.parsed) === null || _a === void 0 ? void 0 : _a.type) === 'transfer'; });
                        if (isTransferred) {
                            const txAmount = tx.meta.postBalances[0] - tx.meta.preBalances[0];
                            if (txAmount <= -config_1.ThresholdAmount * web3_js_1.LAMPORTS_PER_SOL) {
                                const recipientPublicKey = tx.transaction.message.accountKeys[1].pubkey.toBase58();
                                console.log(` - Over ${config_1.ThresholdAmount} SOL transition is detected`);
                                console.log(` - Recipient Address: ${recipientPublicKey}`);
                                console.log(` - Amount: ${-txAmount / web3_js_1.LAMPORTS_PER_SOL} SOL`);
                                if (recipientPublicKey !== address.toBase58())
                                    (0, data_1.addWallet)(recipientPublicKey);
                            }
                        }
                        //check new token mint
                        const isMinted = tx.transaction.message.instructions.find((item) => { var _a; return ((_a = item.parsed) === null || _a === void 0 ? void 0 : _a.type) === 'mintTo'; });
                        if (isMinted) {
                            const newToken = isMinted.parsed.info.mint;
                            const totalSupply = isMinted.parsed.info.amount;
                            const newTokenInfo = yield (0, spl_token_1.getMint)(config_1.Solana_Connection, new web3_js_1.PublicKey(newToken));
                            console.log(`\n# New token is minted: ${newToken}, Decimal: ${newTokenInfo.decimals.toString()}, Total Supply: ${totalSupply.toString()}`);
                        }
                        //check new Pool information
                        const createdPool = tx.transaction.message.instructions.find((item) => item.programId.toBase58() === config_1.RAYDIUM_PUBLIC_KEY);
                        if (createdPool) {
                            const baseToken = createdPool.accounts[8];
                            const quoteToken = createdPool.accounts[9];
                            // const baseTokenInfo = await getMint(connection, baseToken);
                            // const quoteTokenInfo = await getMint(connection, quoteToken);
                            console.log('\n# New Pool is created');
                            console.log(` - Base token: ${baseToken}`); //, ${baseTokenInfo.decimals.toString()}`);
                            console.log(` - Quote token: ${quoteToken}`); //, ${quoteTokenInfo.decimals.toString()}`);
                            (0, data_1.addNewToken)(baseToken.toBase58());
                        }
                    }));
                }
            }
            catch (error) {
                console.error(` * Error monitoring transactions for ${address.toBase58()}: ${error}`);
            }
        }), config_1.IntervalTime);
    });
}
exports.moniterWallet = moniterWallet;
// // // The wallet address you want to monitor
// const monitoredAddress = new PublicKey('HzUjY1eHsGrwV1KrSqaLSkm48urhkExtok5cwz1rqD4');
// // // Start monitoring the specified address
// // checkBalance(monitoredAddress);
// moniterWallet(monitoredAddress);
