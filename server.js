import express from "express";
import { readFile } from "fs/promises";
import { createServer } from "https";
import { pay01ErgFromAddress } from "./lib.js";

const app = express();

function base64Encode(buf) {
  // Standard Base64 with '=' padding
  return buf.toString('base64')
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
    // 1) Grab your raw reduced transaction bytes
    //    (make sure pay01ErgFromAddress returns a Buffer or string)
    const reduced = await pay01ErgFromAddress();

    // 2) Encode it as STANDARD Base64 (with padding '=')
    const encoded = base64Encode(reduced);

    // 3) Send JSON with the padded Base64
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

const PORT = 7777;
const options = {
  key: await readFile("/etc/letsencrypt/live/ergfi.xyz/privkey.pem"),
  cert: await readFile("/etc/letsencrypt/live/ergfi.xyz/fullchain.pem")
};

createServer(options, app).listen(PORT, "0.0.0.0", () => {
  console.log(`HTTPS server running on port ${PORT}`);
});
