const crypto = require("crypto");

// Replace these with your actual API keys and secrets.
const apiKey = "fr7iywqNxyPRTQQF4bES9qfznzufDWwd";
const apiSecret = `MIIEowIBAAKCAQEA0/rmU/7Zr0jvIS1ICkKLi53VsVoTqOLO/ESXv/vT6v9dZcs0
  mNQAE+wWIs3I3qRlKYP3pSZqMv5gZCm01K64egClwBv5/SfOgqJ4eUVbhWk3J0p/
  K7ID4S2sR0PcPDtVvDC3IzLbs5t4ACZ9m4AQTgNQdfg4sQ4gMcP21I7Nu0ssVX9J
  6TdqAZzmHQWYhy0h3EN3RSO8JNUFkQRHwtbL9w0+DLx7iIwJX1yPQFy/tiQfQzvQ
  NTVx5Grv5M7FUVn0tjH6I5pYCLZ9CDjtAulBDpVov+rG1z0hqVsEPiDl5VRjo6TM
  zKSqwIoA0v2aY8S1U4F/Kon4N2rWDEYcGVdYImgQIDAQABAoIBACFhJquBQeJ6B2M
  DmvAcnXs3s1V0vneXjMTEl4/KGf+Q5R6uRRz+rN8q9eQT1yqufq3OwNrIzzr/HXZ
  ULo+AAkNoaZQR1T3r/bpN4eb9hr/ul7tsBp+lT6qSgJz6A1LyPezVKL1NEXyLXXa
  XtPxCTrwxYrsg8W/zV3SSMKdsz0w4k8`;

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
