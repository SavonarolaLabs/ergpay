import express from "express";
import { readFile } from "fs/promises";
import { createServer } from "https";
import { pay01ErgFromAddress } from "./lib.js";

const app = express();

const swapRequestParams =
	"swapPair=ERG/SIGUSD&amount=100&ePayLinkId=abcd1234&lastInput=xyz789&payerAddress=#P2PK_ADDRESS&feeMining=0.01";

app.get("/", (req, res) => {
	res.send(`
<html>
  <body>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const url = window.location.host + "/swap?${swapRequestParams}";
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

app.get("/swap/", async (req, res) => {
	try {
		const params = {
			swapPair: req.query.swapPair,
			amount: Number(req.query.amount),
			ePayLinkId: req.query.ePayLinkId,
			lastInput: req.query.lastInput,
			payerAddress: req.query.payerAddress,
			feeMining: Number(req.query.feeMining),
		};

		console.log("Received swap params:", params);

		const reducedBase64 = await pay01ErgFromAddress();

		res.setHeader("Content-Type", "application/json");
		res.json({ reducedTx: reducedBase64 });
	} catch (err) {
		console.error("Error in /swap:", err);
		res.status(500).json({ error: String(err) });
	}
});

app.get("/ney/:p2pk", (req, res) => {
	res.json({ message: req.params.p2pk, messageSeverity: "ERROR" });
});

const PORT = 7777;
const options = {
	key: await readFile("/etc/letsencrypt/live/ergfi.xyz/privkey.pem"),
	cert: await readFile("/etc/letsencrypt/live/ergfi.xyz/fullchain.pem"),
};

createServer(options, app).listen(PORT, "0.0.0.0", () => {
	console.log(`HTTPS server running on port ${PORT}`);
});
