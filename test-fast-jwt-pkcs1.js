const crypto = require('crypto');
const fastJwt = require('fast-jwt');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
});

const pubB64 = Buffer.from(publicKey).toString('base64').replace(/\s/g, '');
const privB64 = Buffer.from(privateKey).toString('base64').replace(/\s/g, '');

const privPEM = Buffer.from(privB64, 'base64').toString('utf8');

console.log("=== TRYING FAST-JWT ===");
try {
    const signer = fastJwt.createSigner({ key: privPEM, algorithm: 'RS256' });
    const token = signer({ foo: 'bar' });
    console.log("FAST-JWT SIGN SUCCESS!", token.substring(0, 20) + "...");
    const fs = require('fs');
    fs.writeFileSync('easypanel-keys-final.txt', `JWT_PRIVATE_KEY_BASE64=${privB64}\nJWT_PUBLIC_KEY_BASE64=${pubB64}\n`);
    console.log("Wrote keys to easypanel-keys-final.txt");
} catch (e) {
    console.error("FAST-JWT FAILED:", e);
}
