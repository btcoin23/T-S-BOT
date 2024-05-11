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
const web3_js_1 = require("@solana/web3.js");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const anchor_1 = require("@coral-xyz/anchor");
const bs58_1 = __importDefault(require("bs58"));
/**
 * Class representing a Raydium Swap operation.
 */
class RaydiumSwap {
    /**
   * Create a RaydiumSwap instance.
   * @param {string} RPC_URL - The RPC URL for connecting to the Solana blockchain.
   * @param {string} WALLET_PRIVATE_KEY - The private key of the wallet in base58 format.
   */
    constructor(RPC_URL, WALLET_PRIVATE_KEY) {
        this.connection = new web3_js_1.Connection(RPC_URL, { commitment: 'confirmed' });
        this.wallet = new anchor_1.Wallet(web3_js_1.Keypair.fromSecretKey(Uint8Array.from(bs58_1.default.decode(WALLET_PRIVATE_KEY))));
    }
    /**
    * Loads all the pool keys available from a JSON configuration file.
    * @async
    * @returns {Promise<void>}
    */
    loadPoolKeys(liquidityFile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const liquidityJsonResp = yield fetch(liquidityFile);
            if (!liquidityJsonResp.ok)
                return;
            const liquidityJson = (yield liquidityJsonResp.json());
            const allPoolKeysJson = [...((_a = liquidityJson === null || liquidityJson === void 0 ? void 0 : liquidityJson.official) !== null && _a !== void 0 ? _a : []), ...((_b = liquidityJson === null || liquidityJson === void 0 ? void 0 : liquidityJson.unOfficial) !== null && _b !== void 0 ? _b : [])];
            this.allPoolKeysJson = allPoolKeysJson;
        });
    }
    /**
   * Finds pool information for the given token pair.
   * @param {string} mintA - The mint address of the first token.
   * @param {string} mintB - The mint address of the second token.
   * @returns {LiquidityPoolKeys | null} The liquidity pool keys if found, otherwise null.
   */
    findPoolInfoForTokens(mintA, mintB) {
        const poolData = this.allPoolKeysJson.find((i) => (i.baseMint === mintA && i.quoteMint === mintB) || (i.baseMint === mintB && i.quoteMint === mintA));
        if (!poolData)
            return null;
        return (0, raydium_sdk_1.jsonInfo2PoolKeys)(poolData);
    }
    /**
   * Retrieves token accounts owned by the wallet.
   * @async
   * @returns {Promise<TokenAccount[]>} An array of token accounts.
   */
    getOwnerTokenAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const walletTokenAccount = yield this.connection.getTokenAccountsByOwner(this.wallet.publicKey, {
                programId: raydium_sdk_1.TOKEN_PROGRAM_ID,
            });
            return walletTokenAccount.value.map((i) => ({
                pubkey: i.pubkey,
                programId: i.account.owner,
                accountInfo: raydium_sdk_1.SPL_ACCOUNT_LAYOUT.decode(i.account.data),
            }));
        });
    }
    /**
   * Builds a swap transaction.
   * @async
   * @param {string} toToken - The mint address of the token to receive.
   * @param {number} amount - The amount of the token to swap.
   * @param {LiquidityPoolKeys} poolKeys - The liquidity pool keys.
   * @param {number} [maxLamports=100000] - The maximum lamports to use for transaction fees.
   * @param {boolean} [useVersionedTransaction=true] - Whether to use a versioned transaction.
   * @param {'in' | 'out'} [fixedSide='in'] - The fixed side of the swap ('in' or 'out').
   * @returns {Promise<Transaction | VersionedTransaction>} The constructed swap transaction.
   */
    getSwapTransaction(toToken_1, amount_1, poolKeys_1) {
        return __awaiter(this, arguments, void 0, function* (toToken, 
        // fromToken: string,
        amount, poolKeys, maxLamports = 100000, useVersionedTransaction = true, fixedSide = 'in') {
            const directionIn = poolKeys.quoteMint.toString() == toToken;
            const { minAmountOut, amountIn } = yield this.calcAmountOut(poolKeys, amount, directionIn);
            console.log({ minAmountOut, amountIn });
            const userTokenAccounts = yield this.getOwnerTokenAccounts();
            const swapTransaction = yield raydium_sdk_1.Liquidity.makeSwapInstructionSimple({
                connection: this.connection,
                makeTxVersion: useVersionedTransaction ? 0 : 1,
                poolKeys: Object.assign({}, poolKeys),
                userKeys: {
                    tokenAccounts: userTokenAccounts,
                    owner: this.wallet.publicKey,
                },
                amountIn: amountIn,
                amountOut: minAmountOut,
                fixedSide: fixedSide,
                config: {
                    bypassAssociatedCheck: false,
                },
                computeBudgetConfig: {
                    microLamports: maxLamports,
                },
            });
            const recentBlockhashForSwap = yield this.connection.getLatestBlockhash();
            const instructions = swapTransaction.innerTransactions[0].instructions.filter(Boolean);
            if (useVersionedTransaction) {
                const versionedTransaction = new web3_js_1.VersionedTransaction(new web3_js_1.TransactionMessage({
                    payerKey: this.wallet.publicKey,
                    recentBlockhash: recentBlockhashForSwap.blockhash,
                    instructions: instructions,
                }).compileToV0Message());
                versionedTransaction.sign([this.wallet.payer]);
                return versionedTransaction;
            }
            const legacyTransaction = new web3_js_1.Transaction({
                blockhash: recentBlockhashForSwap.blockhash,
                lastValidBlockHeight: recentBlockhashForSwap.lastValidBlockHeight,
                feePayer: this.wallet.publicKey,
            });
            legacyTransaction.add(...instructions);
            return legacyTransaction;
        });
    }
    /**
   * Sends a legacy transaction.
   * @async
   * @param {Transaction} tx - The transaction to send.
   * @returns {Promise<string>} The transaction ID.
   */
    sendLegacyTransaction(tx, maxRetries) {
        return __awaiter(this, void 0, void 0, function* () {
            const txid = yield this.connection.sendTransaction(tx, [this.wallet.payer], {
                skipPreflight: true,
                maxRetries: maxRetries,
            });
            return txid;
        });
    }
    /**
   * Sends a versioned transaction.
   * @async
   * @param {VersionedTransaction} tx - The versioned transaction to send.
   * @returns {Promise<string>} The transaction ID.
   */
    sendVersionedTransaction(tx, maxRetries) {
        return __awaiter(this, void 0, void 0, function* () {
            const txid = yield this.connection.sendTransaction(tx, {
                skipPreflight: true,
                maxRetries: maxRetries,
            });
            return txid;
        });
    }
    /**
      * Simulates a versioned transaction.
      * @async
      * @param {VersionedTransaction} tx - The versioned transaction to simulate.
      * @returns {Promise<any>} The simulation result.
      */
    simulateLegacyTransaction(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const txid = yield this.connection.simulateTransaction(tx, [this.wallet.payer]);
            return txid;
        });
    }
    /**
   * Simulates a versioned transaction.
   * @async
   * @param {VersionedTransaction} tx - The versioned transaction to simulate.
   * @returns {Promise<any>} The simulation result.
   */
    simulateVersionedTransaction(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const txid = yield this.connection.simulateTransaction(tx);
            return txid;
        });
    }
    /**
   * Gets a token account by owner and mint address.
   * @param {PublicKey} mint - The mint address of the token.
   * @returns {TokenAccount} The token account.
   */
    getTokenAccountByOwnerAndMint(mint) {
        return {
            programId: raydium_sdk_1.TOKEN_PROGRAM_ID,
            pubkey: web3_js_1.PublicKey.default,
            accountInfo: {
                mint: mint,
                amount: 0,
            },
        };
    }
    /**
   * Calculates the amount out for a swap.
   * @async
   * @param {LiquidityPoolKeys} poolKeys - The liquidity pool keys.
   * @param {number} rawAmountIn - The raw amount of the input token.
   * @param {boolean} swapInDirection - The direction of the swap (true for in, false for out).
   * @returns {Promise<Object>} The swap calculation result.
   */
    calcAmountOut(poolKeys, rawAmountIn, swapInDirection) {
        return __awaiter(this, void 0, void 0, function* () {
            const poolInfo = yield raydium_sdk_1.Liquidity.fetchInfo({ connection: this.connection, poolKeys });
            let currencyInMint = poolKeys.baseMint;
            let currencyInDecimals = poolInfo.baseDecimals;
            let currencyOutMint = poolKeys.quoteMint;
            let currencyOutDecimals = poolInfo.quoteDecimals;
            if (!swapInDirection) {
                currencyInMint = poolKeys.quoteMint;
                currencyInDecimals = poolInfo.quoteDecimals;
                currencyOutMint = poolKeys.baseMint;
                currencyOutDecimals = poolInfo.baseDecimals;
            }
            const currencyIn = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, currencyInMint, currencyInDecimals);
            const amountIn = new raydium_sdk_1.TokenAmount(currencyIn, rawAmountIn, false);
            const currencyOut = new raydium_sdk_1.Token(raydium_sdk_1.TOKEN_PROGRAM_ID, currencyOutMint, currencyOutDecimals);
            const slippage = new raydium_sdk_1.Percent(5, 100); // 5% slippage
            const { amountOut, minAmountOut, currentPrice, executionPrice, priceImpact, fee } = raydium_sdk_1.Liquidity.computeAmountOut({
                poolKeys,
                poolInfo,
                amountIn,
                currencyOut,
                slippage,
            });
            return {
                amountIn,
                amountOut,
                minAmountOut,
                currentPrice,
                executionPrice,
                priceImpact,
                fee,
            };
        });
    }
}
exports.default = RaydiumSwap;
