const crypto = require('crypto');
const fs = require('fs');
const fastJwt = require('fast-jwt');

const keysContent = fs.readFileSync('easypanel-keys.txt', 'utf8');
const privB64 = keysContent.split('\n')[0].replace('JWT_PRIVATE_KEY_BASE64=', '');
const privPEM = Buffer.from(privB64, 'base64').toString('utf8');

console.log("=== PEM ===");
console.log(privPEM);

try {
    const signer = fastJwt.createSigner({ key: privPEM, algorithm: 'RS256' });
    const token = signer({ foo: 'bar' });
    console.log("FAST-JWT SIGN SUCCESS!", token.substring(0, 20) + "...");
} catch (e) {
    console.error("FAST-JWT FAILED:", e);
}
