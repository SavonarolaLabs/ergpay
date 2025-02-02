import express from "express";
import { readFile } from "fs/promises";
import { createServer } from "https";
import { pay01ErgFromAddress } from "./lib.js";
import { encode } from "base64-url";

const app = express();

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
  const reduced = await pay01ErgFromAddress();
  res.json({ reducedTx: encode(JSON.stringify(reduced)) });
});

app.get("/ney/:p2pk", (req, res) => {
  res.json({ message: req.params.p2pk, messageSeverity: "ERROR" });
});

const PORT = 7777;
const options = {
  key: await readFile("/etc/letsencrypt/live/ergfi.xyz/privkey.pem"),
  cert: await readFile("/etc/letsencrypt/live/ergfi.xyz/fullchain.pem")
};

createServer(options, app).listen(PORT, "0.0.0.0", () => {
  console.log(`HTTPS server running on port ${PORT}`);
});
