import { describe, it, expect } from "vitest";
import { pay01ErgFromAddress } from "./lib.js";

describe("pay01ErgFromAddress", () => {
  it("should return a valid transaction", () => {
    const result = pay01ErgFromAddress();
    console.log(result); // Optional: logs output for debugging
    expect(result).toBeDefined();
  });
});
