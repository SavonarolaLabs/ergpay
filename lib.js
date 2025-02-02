import {
	ErgoBoxes,
	UnsignedTransaction,
	ReducedTransaction
} from 'ergo-lib-wasm-nodejs';
import { OutputBuilder, RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder } from '@fleet-sdk/core';


import { fakeContextX } from './fakeContext.js';

/**
 * Converts an unsigned EIP-12 transaction into a ReducedTransaction.
 *
 * @param {Object} unsignedTx - The unsigned transaction in EIP-12 format.
 * @param {Array<Object>} unsignedTx.inputs - The input boxes of the transaction.
 * @param {Array<Object>} unsignedTx.dataInputs - The data boxes of the transaction.
 * @returns {ReducedTransaction} The reduced transaction ready for signing.
 */
export function reducedFromUnsignedTx(unsignedTx) {
	const inputBoxes = ErgoBoxes.from_boxes_json(unsignedTx.inputs);
	const dataBoxes = ErgoBoxes.from_boxes_json(unsignedTx.dataInputs);
	const wasmUnsignedTx = UnsignedTransaction.from_json(JSON.stringify(unsignedTx));
	const context = fakeContextX();
	const reduced = ReducedTransaction.from_unsigned_tx(
		wasmUnsignedTx,
		inputBoxes,
		dataBoxes,
		context
	)
	return reduced.unsigned_tx().to_js_eip12()
}

export const fakeUserBox = {
	"boxId": "1ab9da11fc216660e974842cc3b7705e62ebb9e0bf5ff78e53f9cd40abadd117",
	"value": 147,
	"ergoTree": "0008cd0336100ef59ced80ba5f89c4178ebd57b6c1dd0f3d135ee1db9f62fc634d637041",
	"creationHeight": 9149,
	"assets": [
	  {
		"tokenId": "4ab9da11fc216660e974842cc3b7705e62ebb9e0bf5ff78e53f9cd40abadd117",
		"amount": 1000
	  }
	],
	"additionalRegisters": {
	  "R4": "100204a00b08cd0336100ef59ced80ba5f89c4178ebd57b6c1dd0f3d135ee1db9f62fc634d637041ea02d192a39a8cc7a70173007301"
	},
	"transactionId": "2ab9da11fc216660e974842cc3b7705e62ebb9e0bf5ff78e53f9cd40abadd117",
	"index": 0,
	"address": "3WwbzW6u8hKWBcL1W7kNVMr25s2UHfSBnYtwSHvrRQt7DdPuoXrt",
	"spentTransactionId": "3ab9da11fc216660e974842cc3b7705e62ebb9e0bf5ff78e53f9cd40abadd117",
	"spendingHeight": 147,
	"inclusionHeight": 147,
	"globalIndex": 83927
  };

const userChangeAddress = '9euvZDx78vhK5k1wBXsNvVFGc5cnoSasnXCzANpaawQveDCHLbU';
const height = 1000;

export function pay01ErgFromAddress(address = userChangeAddress) {
	const unsignedTx = new TransactionBuilder(height)
	.from([fakeUserBox])
	.payFee(RECOMMENDED_MIN_FEE_VALUE)
	.sendChangeTo(address)
	.build()
	.toEIP12Object();

	return reducedFromUnsignedTx(unsignedTx);
}
