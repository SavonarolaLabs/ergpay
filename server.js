import express from "express";
import { readFile } from "fs/promises";
import { createServer } from "https";
import { pay01ErgFromAddress } from "./lib.js";

const app = express();

/**
 * Encode raw bytes into URL-safe Base64, same as Java's Base64.getUrlEncoder().
 * 1) Use standard Base64.
 * 2) Replace '+' with '-' and '/' with '_'.
 * 3) Strip trailing '=' padding.
 */
function base64urlEncode(data) {
  // Make sure we have a Buffer
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);

  // 1) Standard Base64
  let encoded = buf.toString("base64");
  // 2) Replace + with -, / with _
  encoded = encoded.replace(/\+/g, "-").replace(/\//g, "_");
  // 3) Remove trailing '='
  encoded = encoded.replace(/=+$/, "");
  return encoded;
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
    // get the reduced transaction bytes (Buffer) from your library
    const reduced = await pay01ErgFromAddress();
    
    // encode them as URL-safe Base64
    const encoded = base64urlEncode(reduced);

    console.log("Encoded reducedTx:", encoded);

    // respond with JSON
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ reducedTx: encoded }));
  } catch (err) {
    console.error("Error in /yey route:", err);
    res.status(500).json({ error: String(err) });
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
