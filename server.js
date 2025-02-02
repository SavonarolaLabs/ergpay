import express from "express";
import { readFile } from "fs/promises";
import { createServer } from "https";
import { pay01ErgFromAddress } from "./lib.js";

const app = express();

/**
 * Encode raw bytes into **standard** Base64, with '+', '/', and '=' padding.
 * This yields strings whose length is always a multiple of 4.
 */
function base64Encode(data) {
  // If `data` is not already a Buffer, convert it
  const buff = Buffer.isBuffer(data) ? data : Buffer.from(data);
  // Return standard Base64 (e.g. "abcd+/==")
  return buff.toString("base64");
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
    // 1. Get the raw transaction bytes (a Buffer) from your library
    const reduced = await pay01ErgFromAddress();

    // 2. Encode them in standard Base64 WITH padding (nothing "URL-safe")
    const encoded = base64Encode(reduced);

    console.log("Sending standard Base64:", encoded);

    // 3. Return JSON with the "reducedTx" property
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ reducedTx: encoded }));
  } catch (error) {
    console.error("Error in /yey route:", error);
    res.status(500).json({ error: String(error) });
  }
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
