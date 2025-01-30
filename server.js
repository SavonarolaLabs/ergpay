import express from "express";
import { pay01ErgFromAddress } from "./lib.js";

const app = express();

app.get("/yey", (req, res) => {
  res.json({ transaction: pay01ErgFromAddress() });
});

app.get("/ney/:p2pk", (req, res) => {
  res.json({ message: req.params.p2pk, messageSeverity: "ERROR" });
});

const PORT = 7777;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
