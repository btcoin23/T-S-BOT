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
exports.getNewTokens = exports.setBoughtToken = exports.removeNewToken = exports.addNewToken = exports.getWallets = exports.removeWallet = exports.addWallet = exports.initializeWallets = void 0;
const config_1 = require("./config");
const getPrice_1 = require("./getPrice");
let wallets = [];
let newTokens = [];
const initializeWallets = () => {
    config_1.TrackWallets.forEach(wal => wallets.push(wal));
};
exports.initializeWallets = initializeWallets;
function addWallet(wallet) {
    if (!wallets.includes(wallet))
        wallets.push(wallet);
}
exports.addWallet = addWallet;
function removeWallet(wallet) {
    wallets = wallets.filter(x => x !== wallet);
}
exports.removeWallet = removeWallet;
function getWallets() {
    return wallets;
}
exports.getWallets = getWallets;
function addNewToken(baseToken) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!wallets.includes(baseToken)) {
            const price = yield (0, getPrice_1.getPrice)(baseToken);
            newTokens.push({ Mint: baseToken, Price: price, Bought: false });
        }
    });
}
exports.addNewToken = addNewToken;
function removeNewToken(baseToken) {
    newTokens = newTokens.filter(x => x.Mint !== baseToken);
}
exports.removeNewToken = removeNewToken;
function setBoughtToken(baseToken) {
    newTokens.find(x => x.Mint === baseToken).Bought = true;
}
exports.setBoughtToken = setBoughtToken;
function getNewTokens() {
    return newTokens;
}
exports.getNewTokens = getNewTokens;
