import {
	ErgoBoxes,
	UnsignedTransaction,
	ReducedTransaction
  } from 'ergo-lib-wasm-nodejs';
  import { RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder } from '@fleet-sdk/core';
  import { createContext } from './fakeContext.js';
  
  /**
   * Converts an unsigned EIP-12 transaction to a ReducedTransaction,
   * then returns its serialized bytes (as a base64 string).
   */
  export async function reducedFromUnsignedTx(unsignedTx) {
	// 1) Prepare input & data boxes
	const inputBoxes = ErgoBoxes.from_boxes_json(unsignedTx.inputs);
	const dataBoxes = ErgoBoxes.from_boxes_json(unsignedTx.dataInputs);
  
	// 2) Recreate the UnsignedTransaction from EIP-12 JSON
	const wasmUnsignedTx = UnsignedTransaction.from_json(JSON.stringify(unsignedTx));
  
	// 3) Create or load the context. Adjust block height as needed
	const context = await createContext(1452652);
  
	// 4) Build a real ReducedTransaction from the unsignedTx
	const reduced = ReducedTransaction.from_unsigned_tx(
	  wasmUnsignedTx,
	  inputBoxes,
	  dataBoxes,
	  context
	);
  
	// 5) Convert the reduced transaction to raw bytes
	const rawBytes = reduced.sigma_serialize_bytes(); // returns a Uint8Array
  
	// 6) Return standard base64 (with `+`, `/`, and `=` padding)
	const base64 = Buffer.from(rawBytes).toString("base64");
	return base64;
  }
  
  // Example input box
  export const fakeUserBox = {
	globalIndex: 45787878,
	inclusionHeight: 1443467,
	address: "9euvZDx78vhK5k1wBXsNvVFGc5cnoSasnXCzANpaawQveDCHLbU",
	spentTransactionId: null,
	boxId: "807e715029f3efba60ccf3a0f998ba025de1c22463c26db53287849ae4e31d3b",
	value: 602310307,
	ergoTree: "0008cd0233e9a9935c8bbb8ae09b2c944c1d060492a8832252665e043b0732bdf593bf2c",
	assets: [],
	creationHeight: 1443463,
	additionalRegisters: {},
	transactionId: "180a362bee63b7a36aad554493df07fe9abe59dc53e1a6266f6584e49e470e3c",
	index: 0
  };
  
  const height = 1000;
  const userChangeAddress = fakeUserBox.address;
  
  /**
   * Builds a minimal transaction, then returns its reduced Tx as base64.
   */
  export async function pay01ErgFromAddress(address = userChangeAddress) {
	// 1) Build an unsigned transaction in EIP-12 format
	const unsignedTx = new TransactionBuilder(height)
	  .from([fakeUserBox])
	  .payFee(RECOMMENDED_MIN_FEE_VALUE)
	  .sendChangeTo(address)
	  .build()
	  .toEIP12Object();
  
	// 2) Convert that unsigned Tx to a base64-encoded ReducedTransaction
	return await reducedFromUnsignedTx(unsignedTx);
  }
  