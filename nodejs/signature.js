const crypto = require("crypto");

// Replace these with your actual API keys and secrets.
const apiKey = "ZqyrjFE8DgCT";
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAoZPMGY90ek4OzQ7FvS7cPnJNECPvRNpaKJDPSPiHmWLFqo52
ZvMYQu9c3r2AjT4VFVJaJoN/qGlruq56ckUGhLp9e/rfv+Q4TtxX8PHjpG5hs7Ft
wV+UVg7W5EGshT8qrHtWdN1DmSg03ZfKIGFSI95179K6tnflpAbtZtvFknM0/ECP
eXAkPCbF7b2/Xv1MkyV/o/QBeumES4rGF7RnBdlTBPeUBZnUPELgsnI8TxTMjeGP
BNrj6R1rCbLh7l6p09lx1/KotZMgtNsGFtuJlhaw5sYhoFvyYeiUpFLpU6vtcuCJ
N5SGtNYl4MOoNasM7Mb3XVVSdO0xiwUhZDvfSwIDAQABAoIBAGdAAeGniSAKt2yT
7wooYrdI5TPWMrTF720StFMF9eivdG674K+C0lMbkDYJ1JbtQB3C5TbNOwtMann9
uuNAdpzkawGJ2+dMmCrUpSGkAPr3SlnAnMlAIZMoomt0CCGRrtxPaHz/U44QYk/k
ClbMueeP5b9d4tBtJ4K8poHfGI6vKg1yzCwpkU8XhkKmFlJZOf4APqYnfjQn9mqI
xYMJVjvJEi0hiMd0kbxV6vg1UxdeasLiyzouBHn940+l4xDbZ1VXz6M6GR5Xhrjp
v8QesIxk4hokA/g5D9RwwER3TdoN90sgzdFeUdKTUeFmvCkz7lD9zpIxHHLf1grw
FATMVjkCgYEAzios5G4ibWaY34H/4qi2cvCCXGpRSVx/VNzS00Rrkxd5oBbcJmml
qpELEqQ3ZevGdkpJIRCd3TPrln/4+Nbb1fXITvCTkQ7TJi0P8/JWUMczmg4VqLwf
nDgcfz3nzWBwpRjQPHD4uFhv7msfPp6PQ4VN103YVd05CvcDxAdbu7cCgYEAyKJ6
HA15qBYCWpN/W8PRyXi2wYCwxT03ZwBZk/3kV9uftPI0W15XGRqESXkl2zgMYng0
kC4YUhXUmF8/L0G2Frs5CogZJBUL1SQ+HEwBsZqIs53NtZWmEfiruVVH1Hn7/PFx
EQ7vXIjCZUbskKn6dNCn+58vVl2w58BtOeclYQ0CgYA8PqjVq7VVwMhlb+ilhGWk
WtHNTagpRuVSmCDnabQBzLdW57c3ZmHp4O6aaPBjUS2yfWy3Q9LNxBFQ7l6D4M1m
zabWIokMt4dOPZbO038TpdJXb0w2/ZpDHUZ+jEmDg24HYKPhNaYIwJcc1aLQuqbk
tTyU8QOJu9aidKJeE0RkKwKBgBohz3XH64iRFU1m2LfDEZgEOQmLEXsfNhAcY457
CzrGSE7xHRCpgP6sDX7kYKHk8vgAYBhHaLOIVGBkR36IOIdNa2iLwXqJozjnt49H
9xCC6Ds82oZEL5U3pmZFTU3HdaLEb82g/Fw5E9jNHBLbkNuWMcr8ONYu7dPBpHhe
OughAoGBAMwMlD8EhDVzXZrgOsJM+8mODQaO7p1mGhnIHMVEZKEFHoBY9DrWChPu
crU11mL2TBLCMT49pyd+XArK9mNBPwxHDj7rJZkQAcn7AKw2M/dxdZroev4JGsKf
yOUJggU3NbOjNMuJQL8JtU5lXV/mNpZpfbQdj1d2CZNJaR/wDM1g
-----END RSA PRIVATE KEY-----`;

function signData(message, privateKeyPEM) {
  try {
    // Parse the private key from the PEM string
    const privateKey = crypto.createPrivateKey(privateKeyPEM);

    const sign = crypto.createSign("RSA-SHA256");
    sign.update(message, "utf8");

    // Sign the data with the private key and RSA-PSS padding
    const signature = sign.sign({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    });

    // Encode the signature as base64
    const signatureBase64 = signature.toString("base64");

    return signatureBase64;
  } catch (err) {
    console.log({ err });
    return "";
  }
}

const createSignature = (method, path, body) => {
  // Define the request body (if applicable).
  const requestBody = JSON.stringify(body) || "";
  // Create a timestamp for the request.
  const timestamp = Date.now().toString();

  // Generate a nonce (random string) for each request.
  const nonce = Math.random().toString(36).substring(2);

  // Create a string to sign based on your API requirements.
  const stringToSign = `${apiKey}${timestamp}${nonce}${path}${method}${requestBody}`;

  const signature = signData(stringToSign, privateKey);

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
  const postBody = { hello: 1, world: 1234 };
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
