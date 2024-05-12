import 'dotenv/config';
import RaydiumSwap from './RaydiumSwap';
import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { SwapConfig, RPC_URL, WALLET_PRIVATE_KEY } from './config'; // Import the configuration
import { checkTxResult } from './checkTxResult';
/**
 * Performs a token swap on the Raydium protocol.
 * Depending on the configuration, it can execute the swap or simulate it.
 */

export const swap = async (tokenA: string, tokenB: string, amountA: number) => {
  /**
   * The RaydiumSwap instance for handling swaps.
   */
  // const raydiumSwap = new RaydiumSwap(RPC_URL, WALLET_PRIVATE_KEY);
  const raydiumSwap = new RaydiumSwap(RPC_URL, WALLET_PRIVATE_KEY);
  console.log(`Raydium swap initialized`);
  /**
   * Load pool keys from the Raydium API to enable finding pool information.
   */
  await raydiumSwap.loadPoolKeys(SwapConfig.liquidityFile);
  console.log(`Loaded pool keys`);

  console.log(`Swapping ${amountA} of ${tokenA} for ${tokenB}...`)

  /**
   * Find pool information for the given token pair.
   */
  const poolInfo = raydiumSwap.findPoolInfoForTokens(tokenA, tokenB);
  if (!poolInfo) {
    console.error('Pool info not found');
    return 'Pool info not found';
  } else {
    console.log('Found pool info');
  }

  /**
   * Prepare the swap transaction with the given parameters.
   */
  const tx = await raydiumSwap.getSwapTransaction(
    tokenB,
    amountA,
    poolInfo,
    SwapConfig.maxLamports,
    SwapConfig.useVersionedTransaction,
    SwapConfig.direction
  );

  /**
   * Depending on the configuration, execute or simulate the swap.
   */
  if (SwapConfig.executeSwap) {
    /**
     * Send the transaction to the network and log the transaction ID.
     */
    const txid = SwapConfig.useVersionedTransaction
      ? await raydiumSwap.sendVersionedTransaction(tx as VersionedTransaction, SwapConfig.maxRetries)
      : await raydiumSwap.sendLegacyTransaction(tx as Transaction, SwapConfig.maxRetries);
    
    console.log(`https://solscan.io/tx/${txid}`);
    // const txResult =  await checkTxResult(txid)
    // if(!txResult){
    //   console.log('transaction is failed, sending transaction again...')
    //   swap(tokenA, tokenB, amountA);
    // }

  } else {
    /**
     * Simulate the transaction and log the result.
     */
    const simRes = SwapConfig.useVersionedTransaction
      ? await raydiumSwap.simulateVersionedTransaction(tx as VersionedTransaction)
      : await raydiumSwap.simulateLegacyTransaction(tx as Transaction);

    console.log(simRes);
  }
};


// swap();
