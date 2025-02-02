// server.js

import express from "express";
import { readFile } from "fs/promises";
import { createServer } from "https";
import { pay01ErgFromAddress } from "./lib.js";

const app = express();

/** Classic Base64 encoder with `=` padding and `+`/`/` */
function base64Encode(buf) {
  return buf.toString('base64');
}

app.get("/", (req, res) => {
  res.send(`
<html>
  <body>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const url = window.location.host + "/yey";
        const ergopayLink = document.createElement("a");
        ergopayLink.href = "ergopay://" + url;
        ergopayLink.innerText = "Open ErgoPay";
        document.body.appendChild(ergopayLink);
      });
    </script>
  </body>
</html>
  `);
});

app.get("/yey", async (req, res) => {
  try {
    // 1) Retrieve the raw ReducedTransaction bytes
    const reducedBytes = await pay01ErgFromAddress();

    // 2) Encode in standard Base64
    const encoded = base64Encode(reducedBytes);

    // 3) Send JSON with "reducedTx" property
    res.setHeader("Content-Type", "application/json");
    res.json({ reducedTx: encoded });
  } catch (err) {
    console.error("Error in /yey:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.get("/ney/:p2pk", (req, res) => {
  res.json({ message: req.params.p2pk, messageSeverity: "ERROR" });
});

// HTTPS server
const PORT = 7777;
const options = {
  key: await readFile("/etc/letsencrypt/live/ergfi.xyz/privkey.pem"),
  cert: await readFile("/etc/letsencrypt/live/ergfi.xyz/fullchain.pem")
};

createServer(options, app).listen(PORT, "0.0.0.0", () => {
  console.log(`HTTPS server running on port ${PORT}`);
});
