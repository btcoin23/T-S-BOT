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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swap = void 0;
const RaydiumSwap_1 = __importDefault(require("./RaydiumSwap"));
require("dotenv/config");
const config_1 = require("./config"); // Import the configuration
/**
 * Performs a token swap on the Raydium protocol.
 * Depending on the configuration, it can execute the swap or simulate it.
 */
const swap = (tokenA, tokenB, amountA) => __awaiter(void 0, void 0, void 0, function* () {
    /**
     * The RaydiumSwap instance for handling swaps.
     */
    const raydiumSwap = new RaydiumSwap_1.default(config_1.RPC_URL, config_1.WALLET_PRIVATE_KEY);
    console.log(`Raydium swap initialized`);
    console.log(`Swapping ${amountA} of ${tokenA} for ${tokenB}...`);
    /**
     * Load pool keys from the Raydium API to enable finding pool information.
     */
    yield raydiumSwap.loadPoolKeys(config_1.SwapConfig.liquidityFile);
    console.log(`Loaded pool keys`);
    /**
     * Find pool information for the given token pair.
     */
    const poolInfo = raydiumSwap.findPoolInfoForTokens(tokenA, tokenB);
    if (!poolInfo) {
        console.error('Pool info not found');
        return 'Pool info not found';
    }
    else {
        console.log('Found pool info');
    }
    /**
     * Prepare the swap transaction with the given parameters.
     */
    const tx = yield raydiumSwap.getSwapTransaction(tokenB, amountA, poolInfo, config_1.SwapConfig.maxLamports, config_1.SwapConfig.useVersionedTransaction, config_1.SwapConfig.direction);
    /**
     * Depending on the configuration, execute or simulate the swap.
     */
    if (config_1.SwapConfig.executeSwap) {
        /**
         * Send the transaction to the network and log the transaction ID.
         */
        const txid = config_1.SwapConfig.useVersionedTransaction
            ? yield raydiumSwap.sendVersionedTransaction(tx, config_1.SwapConfig.maxRetries)
            : yield raydiumSwap.sendLegacyTransaction(tx, config_1.SwapConfig.maxRetries);
        console.log(`https://solscan.io/tx/${txid}`);
    }
    else {
        /**
         * Simulate the transaction and log the result.
         */
        const simRes = config_1.SwapConfig.useVersionedTransaction
            ? yield raydiumSwap.simulateVersionedTransaction(tx)
            : yield raydiumSwap.simulateLegacyTransaction(tx);
        console.log(simRes);
    }
});
exports.swap = swap;
// swap();
