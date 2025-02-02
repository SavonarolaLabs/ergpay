// lib.js

import {
	ErgoBoxes,
	UnsignedTransaction,
	ReducedTransaction
  } from 'ergo-lib-wasm-nodejs';
  import { RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder } from '@fleet-sdk/core';
  import { createContext } from './fakeContext.js';
  
  /**
   * Converts an unsigned EIP-12 transaction (JSON) into a real ReducedTransaction
   * and returns its raw serialized bytes as a Buffer.
   *
   * @param {Object} unsignedTx - The unsigned transaction in EIP-12 format.
   * @returns {Buffer} A Buffer containing the raw bytes of the ReducedTransaction.
   */
  export async function reducedFromUnsignedTx(unsignedTx) {
	// 1) Convert EIP-12 inputs/dataInputs to wasm structures
	const inputBoxes = ErgoBoxes.from_boxes_json(unsignedTx.inputs);
	const dataBoxes = ErgoBoxes.from_boxes_json(unsignedTx.dataInputs);
  
	// 2) Convert EIP-12 JSON to a wasm UnsignedTransaction
	const wasmUnsignedTx = UnsignedTransaction.from_json(
	  JSON.stringify(unsignedTx)
	);
  
	// 3) Create the context (substitute block height / state values as needed)
	const context = await createContext(1452652);
  
	// 4) Build the actual ReducedTransaction
	const reduced = ReducedTransaction.from_unsigned_tx(
	  wasmUnsignedTx,
	  inputBoxes,
	  dataBoxes,
	  context
	);
  
	// 5) Return the serialized bytes (not JSON).
	//    The wallet needs this raw binary to properly sign.
	return Buffer.from(reduced.sigma_serialize_bytes());
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
  
  const userChangeAddress = fakeUserBox.address;
  const height = 1000;
  
  /**
   * Builds a minimal transaction, converts it to EIP-12,
   * then reduces it, returning raw bytes for the wallet to sign.
   */
  export async function pay01ErgFromAddress(address = userChangeAddress) {
	// 1) Build an unsigned transaction with Fleet
	const unsignedTx = new TransactionBuilder(height)
	  .from([fakeUserBox])
	  .payFee(RECOMMENDED_MIN_FEE_VALUE)
	  .sendChangeTo(address)
	  .build()
	  .toEIP12Object();
  
	// 2) Reduce to raw bytes
	return await reducedFromUnsignedTx(unsignedTx);
  }
  