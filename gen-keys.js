const crypto = require('crypto');
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log('---PRIVATE---');
console.log(Buffer.from(privateKey).toString('base64'));

console.log('---PUBLIC---');
console.log(Buffer.from(publicKey).toString('base64'));
