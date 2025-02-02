import { describe, it, expect } from "vitest";
import { pay01ErgFromAddress, unsignedTx } from "./lib.js";
import { signTx } from "./signing.js";
import { BOB_MNEMONIC } from "./mnemonic.js";

describe("pay01ErgFromAddress", () => {
  it("should return a valid transaction", async() => {
    const result = await pay01ErgFromAddress();
    console.log(result); // Optional: logs output for debugging
    expect(result).toBeDefined();

    const asdf = unsignedTx();
    const tx = signTx(asdf, BOB_MNEMONIC);
    expect(tx).toBeDefined();
  });
});
