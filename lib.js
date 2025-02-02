import {
	ErgoBoxes,
	UnsignedTransaction,
	ReducedTransaction
  } from 'ergo-lib-wasm-nodejs';
  import { RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder } from '@fleet-sdk/core';
  import { fakeContext } from './fakeContext.js';
  
  export async function reducedFromUnsignedTx(unsignedTx) {
	const inputBoxes = ErgoBoxes.from_boxes_json(unsignedTx.inputs);
	const dataBoxes = ErgoBoxes.from_boxes_json(unsignedTx.dataInputs);
	const wasmUnsignedTx = UnsignedTransaction.from_json(JSON.stringify(unsignedTx));
	const context = await fakeContext();
  
	const reduced = ReducedTransaction.from_unsigned_tx(
	  wasmUnsignedTx,
	  inputBoxes,
	  dataBoxes,
	  context
	);
  
	const rawBytes = reduced.sigma_serialize_bytes();
	const base64 = base64urlEncode(rawBytes);
	return base64;
  }

  function base64urlEncode(raw) {
	// raw is a Buffer or a string
	const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
	// standard Base64
	let encoded = buf.toString("base64");
	// replace + and / with - and _
	encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_");
	// remove trailing '='
	encoded = encoded.replace(/=+$/, "");
	return encoded;
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

  export async function pay01ErgFromAddress(address = userChangeAddress) {
	const unsignedTx = new TransactionBuilder(height)
	  .from([fakeUserBox])
	  .payFee(RECOMMENDED_MIN_FEE_VALUE)
	  .sendChangeTo(address)
	  .build()
	  .toEIP12Object();
  
	return await reducedFromUnsignedTx(unsignedTx);
  }
  