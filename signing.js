import { createContext } from './fakeContext.js';

import { ErgoBox, ErgoBoxes } from 'ergo-lib-wasm-nodejs';
import { mnemonicToSeedSync } from 'bip39';
import * as wasm from 'ergo-lib-wasm-nodejs';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';

const getWalletAddressSecret = (mnemonic, idx = 0) => {
    let seed = mnemonicToSeedSync(mnemonic);
    const path = calcPathFromIndex(idx);
    let bip32 = BIP32Factory(ecc);
    const extended = bip32.fromSeed(seed).derivePath(path);
    return wasm.SecretKey.dlog_from_bytes(Uint8Array.from(extended.privateKey ?? Buffer.from('')));
};

export async function getProver(mnemonic) {
    const secretKeys = new wasm.SecretKeys();
    secretKeys.add(getWalletAddressSecret(mnemonic));
    return wasm.Wallet.from_secrets(secretKeys);
}

export async function signTx(tx, mnemonic, height) {
    const prover = await getProver(mnemonic);

    const boxesToSign = tx.inputs;
    const boxes_to_spend = ErgoBoxes.empty();
    boxesToSign.forEach((box) => {
        boxes_to_spend.add(ErgoBox.from_json(JSON.stringify(box)));
    });

    const data_boxes = ErgoBoxes.empty();
    tx.dataInputs.forEach((box) => {
        data_boxes.add(ErgoBox.from_json(JSON.stringify(box)));
    });

    const signedTx = prover.sign_transaction(
        await createContext(height),
        wasm.UnsignedTransaction.from_json(JSON.stringify(tx)),
        boxes_to_spend,
        data_boxes
    );
    return signedTx.to_js_eip12();
}

export async function signTxRealContext(tx, mnemonic) {
    const prover = await getProver(mnemonic);

    const boxesToSign = tx.inputs;
    const boxes_to_spend = ErgoBoxes.empty();
    boxesToSign.forEach((box) => {
        boxes_to_spend.add(ErgoBox.from_json(JSON.stringify(box)));
    });

    const data_boxes = ErgoBoxes.empty();
    tx.dataInputs.forEach((box) => {
        data_boxes.add(ErgoBox.from_json(JSON.stringify(box)));
    });

    const signedTx = prover.sign_transaction(
        await createContext(),
        wasm.UnsignedTransaction.from_json(JSON.stringify(tx)),
        boxes_to_spend,
        data_boxes
    );
    return signedTx.to_js_eip12();
}

const RootPathWithoutIndex = "m/44'/429'/0'/0";
const calcPathFromIndex = (index) => `${RootPathWithoutIndex}/${index}`;
