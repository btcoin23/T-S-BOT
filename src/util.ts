import {
  buildSimpleTransaction,
  findProgramAddress,
  InnerSimpleV0Transaction,
  SPL_ACCOUNT_LAYOUT,
  TOKEN_PROGRAM_ID,
  TokenAccount,
} from '@raydium-io/raydium-sdk';
import {
  Connection,
  Keypair,
  PublicKey,
  SendOptions,
  Signer,
  Transaction,
  VersionedTransaction,
  PartiallyDecodedInstruction,
} from '@solana/web3.js';
import { getMint } from '@solana/spl-token';

import {
  RAYDIUM_PUBLIC_KEY,
  addLookupTableInfo,
  connection,
  makeTxVersion,
  wallet,
} from './config';

export async function sendTx(
  connection: Connection,
  payer: Keypair | Signer,
  txs: (VersionedTransaction | Transaction)[],
  options?: SendOptions
): Promise<string[]> {
  const txids: string[] = [];
  for (const iTx of txs) {
    if (iTx instanceof VersionedTransaction) {
      iTx.sign([payer]);
      txids.push(await connection.sendTransaction(iTx, options));
      // txids.push(await this.connection.simulateTransaction(iTx, options));
    } else {
      txids.push(await connection.sendTransaction(iTx, [payer], options));
      // txids.push(await this.connection.simulateTransaction(iTx, [payer], options));
    }
  }
  return txids;
}

export async function getWalletTokenAccount(connection: Connection, wallet: PublicKey): Promise<TokenAccount[]> {
  const walletTokenAccount = await connection.getTokenAccountsByOwner(wallet, {
    programId: TOKEN_PROGRAM_ID,
  });
  return walletTokenAccount.value.map((i) => ({
    pubkey: i.pubkey,
    programId: i.account.owner,
    accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
  }));
}

export async function buildAndSendTx(innerSimpleV0Transaction: InnerSimpleV0Transaction[], options?: SendOptions) {
  const willSendTx = await buildSimpleTransaction({
    connection,
    makeTxVersion,
    payer: wallet.publicKey,
    innerTransactions: innerSimpleV0Transaction,
    addLookupTableInfo: addLookupTableInfo,
  })

  return await sendTx(connection, wallet, willSendTx, options)
}

export function getATAAddress(programId: PublicKey, owner: PublicKey, mint: PublicKey) {
  const { publicKey, nonce } = findProgramAddress(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
  );
  return { publicKey, nonce };
}

export async function sleepTime(ms: number) {
  console.log((new Date()).toLocaleString(), 'sleepTime', ms)
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getPrice(tokenMint: string) {
  try {
    const res: any = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`);
    const data = await res.json();
    const price = data.pairs.find((x: any) => x.priceNative).priceNative
    // console.log(`- Token: ${tokenMint}, Price: ${price}`);
    return Number(price);
  }
  catch (e) {
    await getPrice(tokenMint);
  }
}
// const token = '7t2SY7L485X69uZZ4ateWzyipWv4jML94nB7Z5L2HjYW'
// getPrice(token);


export async function checkTxResult(sig: string) {
  const state = await connection.getSignatureStatus(sig, { searchTransactionHistory: true });
  console.log(state)
  if (state && state.value) {
    if (state.value.err) {
      console.log(`\n# Transaction failed!`)
    } else {
      console.log('\n# Transaction succeeded!')
    }
  } else {
    console.log('Not confirmed yet')
  }
}

// const sig = '5u1opaTeSsM8MYhtqaCuA6AcA3ttqNM4H6gwbgYr2jENLM3arDC6BudD2p7ZzVAgEFfaLxFpsFzRgsVBifJneWWj'
// checkTxResult(sig);

export const checkTokenMint = async (sig: string) => {
  const tx = await connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
  const isMinted: any = tx.transaction.message.instructions.find((item: any) =>
    item.parsed?.type === 'mintTo'
  )
  if (isMinted) {
    const newToken = isMinted.parsed.info.mint;
    const totalSupply = isMinted.parsed.info.amount;
    const newTokenInfo = await getMint(connection, new PublicKey(newToken));
    console.log(`# New token is minted: ${newToken}, Decimal: ${newTokenInfo.decimals.toString()}, Total Supply: ${totalSupply.toString()}`);
    return true;
  }
  return false;
}

// const signature = '2sDAuuaYv51SXoUuKD9RprKM6yVY37y2WbRWqeiaFhqbxBqQnbP2qLQNVfpR9MyNvvEg1t3WuR469q4Eus9J4mbZ';
// checkTokenMint(signature);


export const checkNewPool = async (sig: any) => {
  const tx = await connection.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 });
  const interactRaydium = tx.transaction.message.instructions.find((item: any) =>
    item.programId.toString() === RAYDIUM_PUBLIC_KEY
  ) as PartiallyDecodedInstruction
  console.log(tx)
  const createdPool = tx.meta.logMessages?.find((item: string) => item.includes('Create'))
  if (interactRaydium && createdPool) {
      const ammid = interactRaydium.accounts[4]
      const baseToken = interactRaydium.accounts[8]
      const quoteToken = interactRaydium.accounts[9]

      const baseTokenInfo = await getMint(connection, baseToken);
      const quoteTokenInfo = await getMint(connection, quoteToken);

      const baseDecimal = baseTokenInfo.decimals;
      const quoteDecimal = quoteTokenInfo.decimals;

      const res = tx.meta.logMessages?.find(item => item.includes("InitializeInstruction2"));
      const keyValuePairs = res.split(", ");

      let pcAmount = null;
      let coinAmount = null;
      for (let i = 0; i < keyValuePairs.length; i++) {
          const pair = keyValuePairs[i].split(": ");

          if (pair[0] === "init_pc_amount") {
              pcAmount = parseInt(pair[1], 10); // Convert the value to an integer
          } else if (pair[0] === "init_coin_amount") {
              coinAmount = parseInt(pair[1], 10); // Convert the value to an integer
          }
      }

      const initialPrice = pcAmount / (coinAmount * (10 ** (quoteDecimal - baseDecimal))) 

      console.log(`\n* Txid: ${tx.transaction.signatures} -> New Pool is created`);
      console.log(` - AMMID: ${ammid}`);
      console.log(` - Base token: ${baseToken}, Decimal: ${baseDecimal.toString()}, StartingPrice: ${initialPrice}`);
      console.log(` - Quote token: ${quoteToken}, Decimal: ${quoteDecimal.toString()}`);
  }                    
}

// const signature = '4GQVoKwZke1ohVb6tV6pXL7uAYX1DpWPu8YZhTjVtg4KDXsEbFVpBtSpQXHxwj9csniApUjeYLuvAvn4Ykgc3pUk';
// const signature = '49bpxmjmefb4scnhWYRXVs86vU9WofwGsjazL63GFnNo1EB2aCqjQr5beNqBQNXEFzfAtrfxmo7kpZnpL8gZtJv4';
// const signature = '4RSLHBBZHapXPqYh4EVZdPjL3c5Hovbwoqc5CskffDZgM5Wb3CmBbmWeFVp8BYtmfw2eEbaWav13nrEzc3jaYTrX';
// checkNewPool(signature);