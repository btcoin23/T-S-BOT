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
exports.getWalletTokenAccount = void 0;
const swap_1 = require("./swap");
const config_1 = require("./config");
const moniterWallet_1 = require("./moniterWallet");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const getPrice_1 = require("./getPrice");
const data_1 = require("./data");
const runBot = () => {
    (0, data_1.initializeWallets)();
    moniterWallets();
    buyNewTokens();
    sellNewTokens();
};
const moniterWallets = () => {
    (0, data_1.getWallets)().forEach((wal) => {
        (0, moniterWallet_1.moniterWallet)(wal);
    });
};
const buyNewTokens = () => {
    setInterval(() => {
        (0, data_1.getNewTokens)().forEach(bt => {
            if (!bt.Bought) {
                (0, swap_1.swap)(config_1.WSOL_Mint, bt.Mint, config_1.TokenBuyAmount);
                (0, data_1.setBoughtToken)(bt.Mint);
            }
        });
    }, config_1.IntervalTime);
};
const sellNewTokens = () => {
    setInterval(() => {
        (0, data_1.getNewTokens)().forEach((bt) => __awaiter(void 0, void 0, void 0, function* () {
            const curPrice = yield (0, getPrice_1.getPrice)(bt.Mint);
            if (curPrice >= bt.Price * config_1.TakeProfit) {
                const walletTokenInfs = yield getWalletTokenAccount(config_1.Solana_Connection, config_1.MyWallet.publicKey);
                const acc = walletTokenInfs.find(account => account.accountInfo.mint.toString() === bt.toString());
                const bal = acc.accountInfo.amount;
                (0, swap_1.swap)(bt.Mint, config_1.WSOL_Mint, bal);
                (0, data_1.removeNewToken)(bt.Mint);
            }
        }));
    }, config_1.IntervalTime);
};
function getWalletTokenAccount(connection, wallet) {
    return __awaiter(this, void 0, void 0, function* () {
        const walletTokenAccount = yield connection.getTokenAccountsByOwner(wallet, {
            programId: raydium_sdk_1.TOKEN_PROGRAM_ID,
        });
        return walletTokenAccount.value.map((i) => ({
            pubkey: i.pubkey,
            programId: i.account.owner,
            accountInfo: raydium_sdk_1.SPL_ACCOUNT_LAYOUT.decode(i.account.data),
        }));
    });
}
exports.getWalletTokenAccount = getWalletTokenAccount;
runBot();
