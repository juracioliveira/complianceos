const crypto = require('crypto');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const pubB64 = Buffer.from(publicKey).toString('base64');
const privB64 = Buffer.from(privateKey).toString('base64');

// Must be exactly one line
const fs = require('fs');
fs.writeFileSync('easypanel-keys.txt', `JWT_PRIVATE_KEY_BASE64=${privB64}\nJWT_PUBLIC_KEY_BASE64=${pubB64}\n`);
