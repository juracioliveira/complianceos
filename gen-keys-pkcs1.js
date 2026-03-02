const crypto = require('crypto');
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    // CHANGE to PKCS#1! Node.js crypto / fast-jwt is having issues with PKCS#8
    privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
});

const b64Priv = Buffer.from(privateKey).toString('base64');
const b64Pub = Buffer.from(publicKey).toString('base64');

console.log('---PRIVATE---');
console.log(b64Priv);

console.log('---PUBLIC---');
console.log(b64Pub);

console.log('---TESTING---');
const sign = crypto.createSign('RSA-SHA256');
sign.update('testing');
try {
    sign.sign({ key: Buffer.from(b64Priv, 'base64').toString('utf8'), format: 'pem' });
    console.log("SUCCESS!");
} catch (e) {
    console.log("FAIL", e.message);
}
