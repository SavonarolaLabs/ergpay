import express from "express";
import { readFile } from "fs/promises";
import { createServer } from "https";
import { exec } from "child_process";

const app = express();
const SCRIPT_PATH = "src/lib/ergopay/ergopaySwap.cli.ts";
const PROJECT_DIR = "../ergfi";
const swapRequestParams =
	"swapPair=ERG/SIGUSD&amount=100000000&ePayLinkId=abcd1234&lastInput=ERG&payerAddress=#P2PK_ADDRESS#&feeMining=10000000";

app.get("/", (req, res) => {
	res.send(`
<html>
  <body style="font-size:100px;">
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        const url = window.location.host + "/swap?${swapRequestParams}";
        const ergopayLink = document.createElement("a");
        ergopayLink.href = "ergopay://" + url;
        ergopayLink.innerText = "Open ErgoPay with Address";
        document.body.appendChild(ergopayLink);
      });
    </script>
  </body>
</html>
  `);
});

app.get("/swap/", async (req, res) => {
	try {
		const params = JSON.stringify({
			swapPair: req.query.swapPair,
			amount: Number(req.query.amount),
			ePayLinkId: req.query.ePayLinkId,
			lastInput: req.query.lastInput,
			payerAddress: req.query.payerAddress,
			feeMining: Number(req.query.feeMining),
		});

		console.log("Received swap params:", params);

		const command = `cd ${PROJECT_DIR} && bun run ${SCRIPT_PATH} '${params}'`;

		exec(command, (error, stdout, stderr) => {
			if (error) {
				console.error("Error executing script:", stderr);
				return res.status(500).json({ error: stderr || error.message });
			}
			try {
				const result = JSON.parse(stdout);
				res.json(result);
			} catch (parseError) {
				console.error("Error parsing script output:", stdout);
				res.status(500).json({ error: "Invalid response from script" });
			}
		});
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
