const express = require("express");
const crypto = require("crypto");
const app = express();
const port = 3015;
app.use(express.json());
const secretKey = "kjadskjaskdjaf123";

const verifyCallbackSignature = (message, providedSignature, secretKey) => {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  const computedSignature = hmac.digest("hex");

  // Use a constant-time comparison to prevent timing attacks
  const signaturesMatch = crypto.timingSafeEqual(
    Buffer.from(computedSignature, "hex"),
    Buffer.from(providedSignature, "hex")
  );

  return signaturesMatch;
};

app.post("/aegis-webhook", (req, res) => {
  const callbackId = req.headers["x-aegis-callback-id"];
  const signature = req.headers["x-aegis-signature"];

  const body = req.body;
  console.log({ body, callbackId, signature, headers: req.headers });

  const verifySuccess = verifyCallbackSignature(
    JSON.stringify(body),
    signature,
    secretKey
  );
  console.log({ verifySuccess });
  if (verifySuccess) {
    res.send("Success");
  } else {
    res.status(401).send();
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
