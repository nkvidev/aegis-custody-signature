const crypto = require("crypto");

// Replace these with your actual API keys and secrets.
const apiKey = "your-saas-api-key";
const apiSecret = "your-saas-api-secret";

const createSignature = (method, path, body) => {
  // Define the request body (if applicable).
  const requestBody = JSON.stringify(body) || "";
  // Create a timestamp for the request.
  const timestamp = Date.now().toString();

  // Generate a nonce (random string) for each request.
  const nonce = Math.random().toString(36).substring(2);

  // Create a string to sign based on your API requirements.
  const stringToSign = `${apiKey}${timestamp}${nonce}${path}${method}${requestBody}`;

  // Create an HMAC-SHA256 signature using your API secret.
  const hmac = crypto.createHmac("sha256", apiSecret);
  hmac.update(stringToSign);
  const signature = hmac.digest("hex");

  // Define request headers with API key, timestamp, nonce, and signature.
  const headers = {
    "X-Aegis-Api-Key": apiKey,
    "X-Aegis-Api-Timestamp": timestamp,
    "X-Aegis-Api-Nonce": nonce,
    "X-Aegis-Api-Signature": signature,
  };
  return headers;
};

const test = async () => {
  const postUrl = "http://127.0.0.1:7011/test";
  const postBody = { hello: 1 };
  const postHeaders = createSignature("POST", "/test", postBody);
  await fetch(postUrl, {
    method: "POST",
    headers: postHeaders,
    body: JSON.stringify(postBody),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("API Response:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  const getUrl = "http://127.0.0.1:7011/test";
  const getHeaders = createSignature("GET", "/test");
  await fetch(getUrl, { method: "GET", headers: getHeaders })
    .then((response) => response.json())
    .then((data) => {
      console.log("API Response:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};

test();
