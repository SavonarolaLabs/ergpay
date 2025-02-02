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
	boxId: 'c027ccb7deafc45d68f7b41e583aa8f6ab260ca922d90fb85c330385e2cb0f20',
	value: '1000000000000000',
	ergoTree: '0008cd0233e9a9935c8bbb8ae09b2c944c1d060492a8832252665e043b0732bdf593bf2c',
	assets: [],
	creationHeight: 1443463,
	additionalRegisters: {},
	transactionId: '180a362bee63b7a36aad554493df07fe9abe59dc53e1a6266f6584e49e470e3c',
	index: 0
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
