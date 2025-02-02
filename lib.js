import {
	ErgoBoxes,
	UnsignedTransaction,
	ReducedTransaction
} from 'ergo-lib-wasm-nodejs';
import {RECOMMENDED_MIN_FEE_VALUE, TransactionBuilder } from '@fleet-sdk/core';


import { createContext, fakeContext } from './fakeContext.js';

/**
 * Converts an unsigned EIP-12 transaction into a ReducedTransaction.
 *
 * @param {Object} unsignedTx - The unsigned transaction in EIP-12 format.
 * @param {Array<Object>} unsignedTx.inputs - The input boxes of the transaction.
 * @param {Array<Object>} unsignedTx.dataInputs - The data boxes of the transaction.
 * @returns {ReducedTransaction} The reduced transaction ready for signing.
 */
export async function reducedFromUnsignedTx(unsignedTx) {
	const inputBoxes = ErgoBoxes.from_boxes_json(unsignedTx.inputs);
	const dataBoxes = ErgoBoxes.from_boxes_json(unsignedTx.dataInputs);
	const wasmUnsignedTx = UnsignedTransaction.from_json(JSON.stringify(unsignedTx));
	const context = await createContext(1452652);
	const reduced = ReducedTransaction.from_unsigned_tx(
		wasmUnsignedTx,
		inputBoxes,
		dataBoxes,
		context
	)
	return reduced.unsigned_tx().to_json()
}

export const fakeUserBox = {
    "globalIndex": 45787878,
    "inclusionHeight": 1443467,
    "address": "9euvZDx78vhK5k1wBXsNvVFGc5cnoSasnXCzANpaawQveDCHLbU",
    "spentTransactionId": null,
    "boxId": "807e715029f3efba60ccf3a0f998ba025de1c22463c26db53287849ae4e31d3b",
    "value": 602310307,
    "ergoTree": "0008cd0233e9a9935c8bbb8ae09b2c944c1d060492a8832252665e043b0732bdf593bf2c",
    "assets": [],
    "creationHeight": 1443463,
    "additionalRegisters": {},
    "transactionId": "180a362bee63b7a36aad554493df07fe9abe59dc53e1a6266f6584e49e470e3c",
    "index": 0
  };

const userChangeAddress = '9euvZDx78vhK5k1wBXsNvVFGc5cnoSasnXCzANpaawQveDCHLbU';
const height = 1000;

export function unsignedTx(address = userChangeAddress) {
	const unsignedTx = new TransactionBuilder(height)
	.from([fakeUserBox])
	.payFee(RECOMMENDED_MIN_FEE_VALUE)
	.sendChangeTo(address)
	.build()
	.toEIP12Object();

	return unsignedTx;
}


export async function pay01ErgFromAddress(address = userChangeAddress) {
	const unsignedTx = new TransactionBuilder(height)
	.from([fakeUserBox])
	.payFee(RECOMMENDED_MIN_FEE_VALUE)
	.sendChangeTo(address)
	.build()
	.toEIP12Object();

	return await reducedFromUnsignedTx(unsignedTx);
}
